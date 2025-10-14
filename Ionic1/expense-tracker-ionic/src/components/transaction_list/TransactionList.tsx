import { IonList } from "@ionic/react";
import { Transaction } from "../../models/transaction";
import TransactionListItem from "./TransactionListItem";

interface TransactionListProps {
  transactions: Transaction[];
  onModify: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onModify,
  onDelete,
}) => {
  if (transactions.length === 0) {
      return <p className="ion-padding">No transactions found.</p>
  }

  return (
    <IonList>
        {transactions.map(item => (
            <TransactionListItem 
                key={item.id}
                transaction={item}
                onModify={onModify}
                onDelete={onDelete}
            />
        ))}
    </IonList>
  );
};

export default TransactionList;