import { useState } from "react";
import { useNetwork } from "../../hooks/useNetwork";
import {
  IonChip,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { alertCircle, wifi, cellularOutline } from "ionicons/icons";
import { useAppState } from "../../hooks/useAppState";

const NetworkStatus: React.FC = () => {
  // const { appState } = useAppState();
  const { networkStatus } = useNetwork();
  // JSON.stringify(networkStatus.connectionType)
  return (
    <>
      {networkStatus.connectionType === "wifi" &&
        networkStatus.connected === true && (
          <>
            <IonChip>
              <IonLabel>Online</IonLabel>
              <IonIcon icon={wifi} color="success"></IonIcon>
            </IonChip>
          </>
        )}

      {networkStatus.connectionType === "cellular" &&
        networkStatus.connected === true && (
          <>
            <IonChip>
              <IonLabel>Online</IonLabel>
              <IonIcon icon={cellularOutline} color="success"></IonIcon>
            </IonChip>
          </>
        )}

      {networkStatus.connected === false && (
        <>
          <IonChip>
            <IonLabel>Offline</IonLabel>
            <IonIcon icon={alertCircle} color="warning"></IonIcon>
          </IonChip>
        </>
      )}
    </>
  );
};

export default NetworkStatus;
