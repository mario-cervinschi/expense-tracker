// src/components/TransactionView.tsx
import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
  IonNote,
  IonContent,
} from '@ionic/react';
import { Transaction } from '../../models/transaction';
import TransactionList from '../../components/transaction_list/TransactionList';

interface TransactionViewProps {
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  onModify: (item: Transaction) => void;
  onDelete: (id: string | number) => void;
  onInfiniteScroll: (event: CustomEvent<void>) => void;
  hasMorePages: boolean;
}

const TransactionView: React.FC<TransactionViewProps> = ({
  loading,
  error,
  transactions,
  onModify,
  onDelete,
  onInfiniteScroll,
  hasMorePages,
}) => {
  
  const renderContent = () => {
    if (loading) {
      return (
        <p style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <IonSpinner color="tertiary" />
          Loading your transactions...
        </p>
      );
    }

    if (error) {
      return (
        <IonNote color="danger" className="ion-padding">
          {error}
        </IonNote>
      );
    }

    return (
      <TransactionList
        transactions={transactions}
        onModify={onModify}
        onDelete={onDelete}
        onInfiniteScroll={onInfiniteScroll}
        hasMorePages={hasMorePages}
      />
    );
  };

  return (
    <IonContent style={{ height: '60%' }}>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Your last expenses</IonCardTitle>
          <IonCardSubtitle></IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>{renderContent()}</IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default TransactionView;