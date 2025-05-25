import { useState, useEffect, useRef } from "react";
import { ConfigProvider, theme } from "antd";
import { Typography } from "antd";
import io from "socket.io-client";
import Peer from "peerjs";
import { Toaster } from "react-hot-toast";
import HashLoader from "react-spinners/HashLoader";

import ClientList from "./components/ClientList";
import HeaderSection from "./components/Header";
import AvatarIcon from "./components/AvatarIcon";
import { ClientContext, PeerContext, RemotePeerContext, FileProgressContext, ClientsContext } from "./utils/Contexts";
import { fetchIP, usePeerNameByPeerId } from "./utils/utils";
import { generatePeerName } from "./utils/peerNameGenerator";
import { usePeerConnection } from "./hooks/usePeerConnection";
import { useFileTransfer } from "./hooks/useFileTransfer";

const { Title } = Typography;

const socket = io(import.meta.env.VITE_BACKEND_HOST);

function App() {
  const [clients, setClients] = useState({});
  const [peerId, setPeerId] = useState(null);
  const [peerName, setPeerName] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [remotePeerName, setRemotePeerName] = useState("");
  const [peerRef, setPeerRef] = useState(useRef(null));
  const [connRef, setconnRef] = useState(useRef(null));
  const [ip, setIP] = useState("");

  const getPeerNameByPeerId = usePeerNameByPeerId();
  const { connectToPeer } = usePeerConnection(socket,peerRef,connRef,peerId, peerName, remotePeerName);
  const { setFileToSend, progress, handleData, sendFile } = useFileTransfer(connRef, peerName);

  useEffect(() => {
    setRemotePeerName(getPeerNameByPeerId(remotePeerId));
    const conn = connectToPeer(remotePeerId, getPeerNameByPeerId(remotePeerId));
    if (conn) {
      conn.on("data", handleData);
    }
  }, [remotePeerId]);

  useEffect(() => {
    if (!ip) {
      fetchIP().then((ip) => {
        setIP(ip);
      });
    }

    // Initialize PeerJS
    peerRef.current = new Peer();

    peerRef.current.on("open", async (id) => {
      console.log(id);
      setPeerId(id);
      const name = generatePeerName();
      setPeerName(name);
      socket.emit("registerPeer", { id, name, ip });
    });

    peerRef.current.on("connection", (conn) => {
      connRef.current = conn;
      setRemotePeerId(conn.peer);
      conn.on("data", handleData);
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [ip]);

  useEffect(() => {
    socket.on("clients", setClients);
    socket.on("connectionRequest", ({ from, name }) => {
      setRemotePeerName(name);
      const conn = connectToPeer(from);
      if (conn) {
        conn.on("data", handleData);
      }
      setRemotePeerId(from);
    });
  }, [remotePeerId, remotePeerName]);

  // Add cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <ClientsContext.Provider value={{ clients, setClients }}>
        <HeaderSection style={{ zindex: "100" }} />
        {!peerName ? (
          <div
            style={{
              height: "90vh",
              width: "100vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <HashLoader />
            <Title level={4}>Loading</Title>
          </div>
        ) : (
          <>
            <FileProgressContext.Provider value={{ progress }}>
              <AvatarIcon peerName={peerName} />
              <ClientContext.Provider value={clients}>
                <PeerContext.Provider value={{ peerId, ip }}>
                  <RemotePeerContext.Provider
                    value={{
                      remotePeerName,
                      setRemotePeerId,
                      setRemotePeerName,
                      connectToPeer,
                      sendFile,
                      setFileToSend,
                    }}
                  >
                    <ClientList />
                  </RemotePeerContext.Provider>
                </PeerContext.Provider>
              </ClientContext.Provider>
            </FileProgressContext.Provider>
          </>
        )}
        <Toaster />
      </ClientsContext.Provider>
    </ConfigProvider>
  );
}

export default App;
