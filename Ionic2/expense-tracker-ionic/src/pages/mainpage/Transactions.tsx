// src/pages/mainpage/Tab1.tsx
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import "./Transactions.css";
import { useState } from "react";
import { Transaction } from "../../models/transaction";

import EditTransactionModal from "../../components/transaction/EditTransactonModal";
import { add } from "ionicons/icons";
import { useAuth } from "../auth/AuthContext";
import { useTransactionManager } from "../../hooks/useTransactionManager";
import TransactionHeader from "../../components/transaction/TransactionHeader";
import TransactionView from "../../components/transaction/TransactionView";

const Transactions: React.FC = () => {
  const { logout } = useAuth();
  const name: string | "user_no_name" = "user_no_name";

  const [searchExpense, setSearchExpense] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Transaction | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const sortedTransactions = [...transactions].sort((a, b) => {
    const nameA = a.title?.toLowerCase() || "";
    const nameB = b.title?.toLowerCase() || "";
    if (sortOrder === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  return (
    <IonPage>
      <TransactionHeader
        pendingOpsCount={pendingOpsCount}
        onLogout={handleLogout}
      />

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

        <IonSelect
          value={sortOrder}
          placeholder="Sort by name"
          interface="popover"
          onIonChange={(e) => setSortOrder(e.detail.value)}
          style={{ margin: "10px" }}
        >
          <IonSelectOption value="asc">Name A → Z</IonSelectOption>
          <IonSelectOption value="desc">Name Z → A</IonSelectOption>
        </IonSelect>

        <TransactionView
          loading={loading}
          error={error}
          transactions={sortedTransactions}
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

export default Transactions;
