// src/pages/mainpage/Tab1.tsx
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
  IonSearchbar,
} from "@ionic/react";
import "./Tab1.css";
import { useState } from "react";
import { Transaction } from "../../models/transaction";

import EditTransactionModal from "../../components/transaction_list/EditTransactonModal";
import { add } from "ionicons/icons";
import { useAuth } from "../auth/AuthContext";
import { useTransactionManager } from "../../hooks/useTransactionManager";
import Tab1Header from "./Tab1Header";
import TransactionView from "./TransactionView";

const Tab1: React.FC = () => {
  const { logout } = useAuth();
  const name: string | "user_no_name" = "user_no_name";

  const [searchExpense, setSearchExpense] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    transactions,
    loading,
    error,
    pendingOpsCount,
    hasMorePages,
    onDeleteClick,
    handleSave: handleSaveLogic,
    handleInfiniteScroll,
  } = useTransactionManager(searchExpense);

  const handleLogout = () => {
    logout();
  };

  const onModifyClick = (item: Transaction) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const onAddClick = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleCloseErrorSaveModal = () => {
    setSaveError(null);
  };

  const handleSaveModal = async (updatedTransaction: Transaction) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const success = await handleSaveLogic(updatedTransaction);
      if (success) {
        setIsModalOpen(false);
        setSelectedItem(null);
      }
    } catch (err) {
      setSaveError(
        `Server error: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Saving locally.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage>
      <Tab1Header pendingOpsCount={pendingOpsCount} onLogout={handleLogout} />

      <IonContent>
        <div className="flex flex-column justify-center items-center">
          <h1
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

        <TransactionView
          loading={loading}
          error={error}
          transactions={transactions}
          onModify={onModifyClick}
          onDelete={onDeleteClick} 
          onInfiniteScroll={handleInfiniteScroll} 
          hasMorePages={hasMorePages}
        />

        <EditTransactionModal
          isOpen={isModalOpen}
          transaction={selectedItem}
          onDidDismiss={handleCloseModal}
          onSave={handleSaveModal} 
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
