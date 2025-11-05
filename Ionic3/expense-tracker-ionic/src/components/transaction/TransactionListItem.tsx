import {
  IonIcon,
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
import { imageOutline, locationOutline } from "ionicons/icons";

interface TransactionListItemProps {
  transaction: Transaction;
  onModify: (transaction: Transaction) => void;
  onDelete: (id: number | string) => void;
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
      await onDelete(transaction._id!);
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {transaction.photoFilepath &&(
              <IonIcon icon={imageOutline} />
            )}
            {transaction.latitude && transaction.longitude &&(
              <IonIcon icon={locationOutline} />
            )}
            <h2 style={{ margin: 0 }}>{transaction.title}</h2>
          </div>
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
