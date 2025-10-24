// src/components/Tab1Header.tsx
import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
} from '@ionic/react';
import { cloudOfflineOutline, logOutOutline } from 'ionicons/icons';
import NetworkStatus from '../network/NetworkStatus';

interface TransactionHeaderProps {
  pendingOpsCount: number;
  onLogout: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({ pendingOpsCount, onLogout }) => {
  return (
    <IonHeader translucent={true}>
      <IonToolbar>
        <div slot="start" style={{ paddingLeft: '10px' }}>
          <NetworkStatus />
          {pendingOpsCount > 0 && (
            <IonChip color="warning" style={{ marginLeft: '10px' }}>
              <IonIcon icon={cloudOfflineOutline} />
              <IonLabel>{pendingOpsCount}</IonLabel>
            </IonChip>
          )}
        </div>
        <IonTitle>Expense Tracker</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onLogout}>
            <IonIcon slot="icon-only" icon={logOutOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default TransactionHeader;