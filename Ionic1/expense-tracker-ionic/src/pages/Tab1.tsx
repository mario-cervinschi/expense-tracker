import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonNote,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Tab1.css";
import { useEffect, useState } from "react";
import { Transaction } from "../models/transaction";

import * as MainService from "../services/MainService";
import TransactionList from "../components/transaction_list/TransactionList";
import EditTransactionModal from "../components/transaction_list/EditTransactonModal";
import { add } from "ionicons/icons";

const Tab1: React.FC = () => {
  const name: string | "user_no_name" = "user_no_name";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);

  const onDeleteClick = async (itemId: number) => {
    try {
      await MainService.deleteTransactionById(itemId);
    } catch (err) {
      console.error(err);
    }
  };

  const onModifyClick = (item: Transaction) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedTransaction: Transaction) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (updatedTransaction.id) {
        await MainService.updateTransaction(updatedTransaction);
      } else {
        MainService.createTransaction(updatedTransaction);
      }

      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      setSaveError(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleCloseErrorSaveModal = () => {
    setSaveError(null);
  };

  const onAddClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <p style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <IonSpinner color="tertiary"></IonSpinner>Loading your
            transactions...
          </p>
        </>
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
        onModify={onModifyClick}
        onDelete={onDeleteClick}
      />
    );
  };

  useEffect(() => {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const wsURL = isLocalhost
      ? "ws://localhost:3000"
      : "ws://192.168.1.130:3000";

    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log("WebSocket connection estabilished");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received: ", message);

      switch (message.event) {
        case "created":
          setTransactions((currentTransactions) => [
            ...currentTransactions,
            message.payload.item,
          ]);
          break;
        case "updated":
          setTransactions((currentTransactions) =>
            currentTransactions.map((t) =>
              t.id === message.payload.item.id ? message.payload.item : t
            )
          );
          break;
        case "deleted":
          setTransactions((currentTransactions) =>
            currentTransactions.filter((t) => t.id !== message.payload.item.id)
          );
          break;
        default:
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await MainService.getAllTransactions();
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch transactions. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      console.log("Closing WebSocket connection");
      ws.close();
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expense Tracker</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="flex flex-column justify-center items-center">
          <h1
            className=""
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "0px",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{ fontSize: "24px", fontWeight: "normal", marginTop: "0px" }}
          >
            {name}
          </p>
        </div>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Your last expenses</IonCardTitle>
            <IonCardSubtitle></IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent>{renderContent()}</IonCardContent>
        </IonCard>

        <EditTransactionModal
          isOpen={isModalOpen}
          transaction={selectedItem}
          onDidDismiss={handleCloseModal}
          onSave={handleSave}
          isSaving={isSaving}
          isSaveError={saveError}
          onDidDismissError={handleCloseErrorSaveModal}
        />
      </IonContent>

      <IonFab vertical="bottom" horizontal="center" slot="fixed">
        <IonFabButton onClick={onAddClick}>
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default Tab1;
