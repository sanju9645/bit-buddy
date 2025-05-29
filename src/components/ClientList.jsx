import ClientAvatar from "./ClientAvatar";
import { useContext, useState, useEffect } from "react";
import {
  ClientContext,
  PeerContext,
  RemotePeerContext,
} from "../utils/Contexts";
import ProgressCircle from "./ProgressCircle";

function ClientList() {
  const clients = useContext(ClientContext);
  const peer = useContext(PeerContext);
  const remotePeer = useContext(RemotePeerContext);
  const [clientPositions, setClientPositions] = useState({});

  useEffect(() => {
    const calculatePositions = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const headerHeight = 64; // 4rem header
      const avatarSize = 100; // Assuming avatar size is 100px
      const padding = 20; // Padding between avatars
      
      // Get all clients that need positioning
      const clientsToPosition = Object.values(clients).filter(
        client => "peerId" in client && client.peerId !== peer.peerId
      );

      // Calculate available space
      const availableHeight = windowHeight - headerHeight - padding;
      const availableWidth = windowWidth - padding;
      
      // Calculate how many avatars can fit in a row
      const maxAvatarsPerRow = Math.floor(availableWidth / (avatarSize + padding));
      
      const newPositions = {};
      clientsToPosition.forEach((client, index) => {
        // Calculate row and column for this client
        const row = Math.floor(index / maxAvatarsPerRow);
        const col = index % maxAvatarsPerRow;
        
        // Generate random offset between 5 and 100
        const randomOffset = Math.floor(Math.random() * (100 - 5 + 1)) + 5;
        
        // Calculate position with padding and ensure unique positions
        const top = headerHeight + (row * (avatarSize + padding)) + randomOffset;
        const left = padding + (col * (avatarSize + padding));
        
        // Ensure position is within viewport
        const finalTop = Math.min(top, windowHeight - avatarSize - padding);
        const finalLeft = Math.min(left, windowWidth - avatarSize - padding);
        
        newPositions[client.id] = { top: finalTop, left: finalLeft };
      });
      
      setClientPositions(newPositions);
    };

    calculatePositions();
    
    // Recalculate positions on window resize
    window.addEventListener('resize', calculatePositions);
    return () => window.removeEventListener('resize', calculatePositions);
  }, [clients, peer.peerId]);
  
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden'
    }}>
      {Object.values(clients).map(
        (client) =>
          "peerId" in client &&
          client.peerId !== peer.peerId && (
            <div key={client.id}>
              {client.id !== peer.peerId &&
                peer.ip === client.ip_addr && (
                  <div
                    style={{
                      position: "absolute",
                      width: "fit-content",
                      top: `${clientPositions[client.id]?.top || 0}px`,
                      left: `${clientPositions[client.id]?.left || 0}px`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ProgressCircle>
                      <ClientAvatar client={client} />
                    </ProgressCircle>
                  </div>
                )}
            </div>
          )
      )}
    </div>
  );
}

export default ClientList;
