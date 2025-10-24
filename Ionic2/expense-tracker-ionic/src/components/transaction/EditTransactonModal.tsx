import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonDatetime,
  IonToggle,
  IonLoading,
  IonAlert,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { Transaction } from "../../models/transaction";

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onDidDismiss: () => void;
  onSave: (transaction: Transaction) => void;
  isSaving: boolean;
  isSaveError: string | null;
  onDidDismissError: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  transaction,
  onDidDismiss,
  onSave,
  isSaving,
  isSaveError,
  onDidDismissError,
}) => {
  const [editableTransaction, setEditableTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    if(isOpen){
      if(transaction){
        setEditableTransaction(transaction);        
      } else {
        setEditableTransaction({
          _id: null,
          title: '',
          date: new Date(),
          sum: 0,
          income: false,
        });
      }
    }
  }, [isOpen, transaction]);

  const handleInputChange = (e: any) => {
    if (!editableTransaction) return;

    const { name, value, checked, type } = e.target;
    let finalValue: any;

    if (name === "date") {
      finalValue = new Date(e.detail.value);
    } else if (name === "sum") {
      finalValue = parseFloat(value) || 0;
    } else if (name === "income" || type === "checkbox") {
      finalValue = checked;
    } else {
      finalValue = value;
    }

    setEditableTransaction({
      ...editableTransaction,
      [name]: finalValue,
    });
  };

  const handleSaveClick = () => {
    if (editableTransaction) {
      onSave(editableTransaction);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Modify Transaction</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDidDismiss}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {editableTransaction && (
          <>
            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonInput
                name="title"
                value={editableTransaction.title}
                onIonChange={handleInputChange}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Date</IonLabel>
              <IonDatetime
                name="date"
                value={editableTransaction.date.toISOString()}
                presentation="date"
                onIonChange={handleInputChange}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Sum</IonLabel>
              <IonInput
                name="sum"
                type="number"
                value={editableTransaction.sum}
                onIonChange={handleInputChange}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Income</IonLabel>
              <IonToggle
                name="income"
                checked={editableTransaction.income}
                onIonChange={handleInputChange}
              />
            </IonItem>
            <IonButton
              expand="block"
              onClick={handleSaveClick}
              className="ion-margin-top"
            >
              Save Changes
            </IonButton>
          </>
        )}

        <IonLoading
          isOpen={isSaving}
          message={"Saving..."}
          spinner="circles"
        ></IonLoading>

        <IonAlert
          isOpen={!!isSaveError}
          header={"Error"}
          message={isSaveError || ""}
          buttons={["OK"]}
          onDidDismiss={onDidDismissError}
        ></IonAlert>
      </IonContent>
    </IonModal>
  );
};

export default EditTransactionModal;
