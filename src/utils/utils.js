import { useContext } from 'react';
import { ClientsContext } from './Contexts';

export const fetchIP = async () => {
  //fetch browser IP address
  const res = await fetch("https://api.ipify.org?format=json");
  const data = await res.json();
  console.log(data);
  return data.ip;
};

export const usePeerNameByPeerId = () => {
  const { clients } = useContext(ClientsContext);
  
  return (peerId) => {
    for (let key in clients) {
      if (clients[key].peerId === peerId) {
        return clients[key].peerName;
      }
    }
    return "";
  };
};