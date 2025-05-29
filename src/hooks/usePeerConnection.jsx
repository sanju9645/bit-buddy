import { useContext } from 'react';
import { toast } from 'react-hot-toast';
import { ClientsContext } from '../utils/Contexts';

export const usePeerConnection = (socket, peerRef, connRef, peerId, peerName, remotePeerName) => {
  const { clients } = useContext(ClientsContext);

  const connectToPeer = (clientId, clientName = "") => {
    if (peerRef.current && clientId) {
      const conn = peerRef.current.connect(clientId);
      connRef.current = conn;

      conn.on("open", () => {
        toast.success(
          "Connected to the Client " +
            (clientName ? clientName : remotePeerName)
        );
        
        socket.emit("connectPeer", {
          clientId,
          from: peerId,
          name: peerName,
        });
      });

      conn.on("close", () => {
        toast.error("The client was disconnected");
      });

      return conn;
    }
    return null;
  };

  return { connectToPeer };
}; 