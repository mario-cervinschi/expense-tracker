import {
  IonButton,
  IonButtons,
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
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import "./Tab1.css";
import { use, useEffect, useState } from "react";
import { Transaction } from "../../models/transaction";

import * as MainService from "../../services/MainService";
import TransactionList from "../../components/transaction_list/TransactionList";
import EditTransactionModal from "../../components/transaction_list/EditTransactonModal";
import { add, logOutOutline } from "ionicons/icons";
import { useAuth } from "../auth/AuthContext";
import NetworkStatus from "../../components/network/NetworkStatus";

const Tab1: React.FC = () => {
  const { logout } = useAuth();
  const name: string | "user_no_name" = "user_no_name";

  const handleLogout = () => {
    logout();
  };

  const [searchExpense, setSearchExpense] = useState<string>("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

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
      if (updatedTransaction._id) {
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

  const handleInfiniteScroll = async (event: CustomEvent<void>) => {
    try {
      const data = await MainService.getPagedTransactions(page + 1);

      const formattedData = data.map((t) => ({
        ...t,
        date: new Date(t.date),
      }));

      setTransactions((prev) => [...prev, ...formattedData]);

      setPage((prev) => prev + 1);

      setHasMorePages(data.length === MainService.PAGE_LIMIT);
    } catch (err) {
      console.error(err);
    } finally {
      (event.target as HTMLIonInfiniteScrollElement).complete();
    }
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
        onInfiniteScroll={handleInfiniteScroll}
        hasMorePages={hasMorePages}
      />
    );
  };

  const fetchTransactions = async (filter?: string) => {
    try {
      setLoading(true);
      let data;

      if (filter && filter.trim()) {
        data = await MainService.getFilteredPagedTransactions(
          1,
          filter.trim()
        );
      } else {
        data = await MainService.getPagedTransactions(1);
      }
      
      const formattedData = data.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
      }));

      setTransactions(formattedData);
      setPage(1);
      setHasMorePages(data.length === MainService.PAGE_LIMIT);
      setError(null);
    } catch (err) {
      setError("Failed to fetch transactions. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(searchExpense);
  }, [searchExpense])

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => {
      console.log("WebSocket connection estabilished");

      const token = localStorage.getItem("authToken");
      if (token) {
        ws.send(JSON.stringify({ type: "authorization", payload: { token } }));
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message received: ", message);

      const payloadWithDate = {
        ...message.payload,
        date: new Date(message.payload.date),
      };

      switch (message.type) {
        case "created":
          setTransactions((currentTransactions) => [
            payloadWithDate,
            ...currentTransactions,
          ]);
          break;
        case "updated":
          setTransactions((currentTransactions) =>
            currentTransactions.map((t) =>
              t._id === payloadWithDate._id ? payloadWithDate : t
            )
          );
          break;
        case "deleted":
          setTransactions((currentTransactions) =>
            currentTransactions.filter((t) => t._id !== payloadWithDate._id)
          );
          break;
        default:
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    fetchTransactions();

    return () => {
      console.log("Closing WebSocket connection");
      ws.close();
    };
  }, []);

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <div slot="start" style={{ paddingLeft: "10px" }}>
            <NetworkStatus />
          </div>
          <IonTitle>Expense Tracker</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
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
        <IonSearchbar
          value={searchExpense}
          placeholder="Search (eg. 2025-10-21, title)"
          debounce={1000}
          onIonInput={(e) => setSearchExpense(e.detail.value!)}
        ></IonSearchbar>
        <IonContent style={{ height: "60%" }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Your last expenses</IonCardTitle>
              <IonCardSubtitle></IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>{renderContent()}</IonCardContent>
          </IonCard>
        </IonContent>
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
