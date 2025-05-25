import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import FileTransferWorker from '../utils/fileTransferWorker?worker';
import FileTransferConfirmation from '../components/FileTransfer/FileTransferConfirmation';

export const useFileTransfer = (connRef, peerName) => {
  const [fileToSend, setFileToSend] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFilename] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingFileInfo, setPendingFileInfo] = useState(null);

  const receivedChunks = useRef([]);
  const totalFileSize = useRef(0);
  const receivedBytes = useRef(0);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      setPendingFile(null);
      setPendingFileInfo(null);
      setProgress(0);
      setFileToSend(null);
      receivedChunks.current = [];
      receivedBytes.current = 0;
      totalFileSize.current = 0;
    };
  }, []);

  const handleData = (data) => {
    if (data.fileRequest) {
      // Show confirmation dialog when receiving file request
      setPendingFileInfo(data);
      toast(
        (t) => (
          <FileTransferConfirmation
            data={data}
            onAccept={() => {
              connRef.current.send({ fileAccepted: true });
              setPendingFile(data);
              toast.dismiss(t.id);
              toast.success("File transfer accepted");
            }}
            onDecline={() => {
              connRef.current.send({ fileAccepted: false });
              setPendingFileInfo(null);
              setPendingFile(null);
              toast.dismiss(t.id);
              toast.error("File transfer declined");
            }}
          />
        ),
        {
          duration: 30000,
          position: "top-center",
          style: {
            padding: "16px",
            borderRadius: "8px",
          },
        }
      );
      return;
    }

    if (data.fileAccepted === false) {
      toast.dismiss();
      toast.error("File transfer was declined");
      setFileToSend(null);
      setProgress(0);
      return;
    }

    if (data.fileAccepted === true) {
      toast.dismiss();
      toast.success("File transfer accepted");
      startFileTransfer();
      return;
    }

    if (data.fileSize) {
      totalFileSize.current = data.fileSize;
    }
    if (data.fileName) {
      setFilename(data.fileName || "File");
    }

    if (data.fileChunk) {
      // Store chunks in order
      receivedChunks.current[data.chunkIndex] = data.fileChunk;
      receivedBytes.current += data.fileChunk.byteLength;
      setProgress(Math.ceil((receivedBytes.current / totalFileSize.current) * 100));
      connRef.current.send({ ack: true });
    } else if (data.fileComplete) {
      // Filter out any undefined chunks and combine
      const blob = new Blob(receivedChunks.current.filter(chunk => chunk !== undefined));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName;
      a.click();

      receivedChunks.current = [];
      receivedBytes.current = 0;
      setFilename('');
      toast.success('Received file: ' + data.fileName);
    }
  };

  const sendFile = () => {
    if (!connRef.current || !fileToSend) return;

    // Clear any existing listeners
    connRef.current.removeAllListeners("data");
    connRef.current.on("data", handleData);

    // Send request to receiver
    connRef.current.send({
      fileRequest: true,
      fileName: fileToSend.name,
      fileSize: fileToSend.size,
      senderName: peerName,
    });

    toast.loading("Waiting for receiver to accept...", {
      duration: 30000,
    });
  };

  const startFileTransfer = () => {
    if (!connRef.current || !fileToSend) return;

    toast.dismiss();
    const file = fileToSend;
    setFilename(file.name);
    
    const CHUNK_SIZE = 256 * 1024;
    const CONCURRENT_CHUNKS = 5; // Number of parallel transfers
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let completedChunks = 0;
    let activeWorkers = 0;
    const pendingChunks = Array.from({ length: totalChunks }, (_, i) => i);
    const workers = [];

    // Send initial file metadata
    connRef.current.send({
      fileSize: file.size,
      fileName: file.name,
    });

    const processNextChunk = () => {
      while (activeWorkers < CONCURRENT_CHUNKS && pendingChunks.length > 0) {
        const chunkIndex = pendingChunks.shift();
        if (chunkIndex === undefined) break;

        const worker = new FileTransferWorker();
        workers.push(worker);
        activeWorkers++;

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        
        worker.postMessage({
          file: file.slice(start, end),
          chunkIndex,
          totalChunks
        });

        worker.onmessage = (e) => {
          const { chunkData, chunkIndex } = e.data;
          
          // Send the processed chunk
          connRef.current.send({ 
            fileChunk: chunkData,
            chunkIndex,
            totalChunks
          });
        };
      }
    };

    connRef.current.on('data', (data) => {
      if (data.ack) {
        completedChunks++;
        activeWorkers--;
        setProgress(Math.floor((completedChunks / totalChunks) * 100));

        if (completedChunks === totalChunks) {
          // Cleanup workers
          workers.forEach(worker => worker.terminate());
          
          connRef.current.send({
            fileComplete: true,
            fileName: file.name,
          });
          toast.success('File sent successfully!');
        } else {
          processNextChunk();
        }
      }
    });

    // Start initial batch of workers
    processNextChunk();
  };

  return {
    fileToSend,
    setFileToSend,
    progress,
    fileName,
    pendingFile,
    pendingFileInfo,
    handleData,
    sendFile,
    startFileTransfer
  };
}; 