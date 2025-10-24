import { IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonList } from "@ionic/react";
import { Transaction } from "../../models/transaction";
import TransactionListItem from "./TransactionListItem";
import { useState } from "react";

interface TransactionListProps {
  transactions: Transaction[];
  onModify: (transaction: Transaction) => void;
  onDelete: (id: number | string) => void;
  onInfiniteScroll: (event: CustomEvent<void>) => void;
  hasMorePages: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onModify,
  onDelete,
  onInfiniteScroll,
  hasMorePages,
}) => {
  if (transactions.length === 0) {
    return <p className="ion-padding">No transactions found.</p>;
  }

  return (
    <>
      <IonList>
        {transactions.map((item) => (
          <TransactionListItem
            key={item._id}
            transaction={item}
            onModify={onModify}
            onDelete={onDelete}
          />
        ))}
      </IonList>
      <IonInfiniteScroll
      onIonInfinite={onInfiniteScroll} disabled={!hasMorePages}>
        <IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Loading more transactions..."></IonInfiniteScrollContent>
      </IonInfiniteScroll>
    </>
  );
};

export default TransactionList;
