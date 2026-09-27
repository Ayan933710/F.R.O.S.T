import { createContext, useState, useContext } from 'react';

const IceNetContext = createContext(null);

export function IceNetProvider({ children }) {
 const [sealedManifestHash, setSealedManifestHash] = useState(null);
 const [isNetworkActive, setIsNetworkActive] = useState(true);
 const [globalAlerts, setGlobalAlerts] = useState([]);
 const [requisitions, setRequisitions] = useState([]);

 const addRequisition = (newReq) => {
  setRequisitions((prev) => [newReq, ...prev]);
 };

 return (
  <IceNetContext.Provider
   value={{
    sealedManifestHash,
    setSealedManifestHash,
    isNetworkActive,
    setIsNetworkActive,
    globalAlerts,
    setGlobalAlerts,
    requisitions,
    setRequisitions,
    addRequisition,
   }}
  >
   {children}
  </IceNetContext.Provider>
 );
}

export function useIceNet() {
 const context = useContext(IceNetContext);
 if (!context) {
  throw new Error('useIceNet must be used within an IceNetProvider');
 }
 return context;
}
