import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonNote,
  IonSpinner,
} from "@ionic/react";
import { Transaction } from "../../models/transaction";
import { useState } from "react";

interface TransactionListItemProps {
  transaction: Transaction;
  onModify: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  onModify,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
    } catch (err) {
      console.error("Failed to delete transaction: ", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <IonItemSliding>
      <IonItem>
        <IonLabel>
          <h2>{transaction.title}</h2>
          <IonNote>{transaction.date.toLocaleDateString("ro-RO")}</IonNote>
        </IonLabel>

        <div slot="end" className={transaction.income ? "income" : "expense"}>
          {transaction.income ? "+" : "-"}
          {transaction.sum.toFixed(2)} RON
        </div>
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption onClick={() => onModify(transaction)}>
          Modify
        </IonItemOption>
        <IonItemOption
          color="danger"
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? <IonSpinner name="dots"></IonSpinner> : "Delete"}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default TransactionListItem;
