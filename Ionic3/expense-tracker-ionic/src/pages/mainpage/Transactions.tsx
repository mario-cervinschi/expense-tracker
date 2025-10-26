import {
  createAnimation,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
  IonSearchbar,
} from "@ionic/react";
import "./Transactions.css";
import { useEffect, useRef, useState } from "react";
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
  const elCRef = useRef(null);

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

  function groupAnimations() {
    const elB = document.querySelector(".square-b");
    if (elB && elCRef.current) {
      const animationA = createAnimation()
        .addElement(elB)
        .fromTo("transform", "scale(1)", "scale(1.5)");
      const animationB = createAnimation()
        .addElement(elCRef.current)
        .fromTo("transform", "scale(1)", "scale(0.5)");
      const parentAnimation = createAnimation()
        .duration(5000)
        .addAnimation([animationA, animationB]);
      parentAnimation.play();
    }
  }

  useEffect(groupAnimations, []);

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
    <IonPage className="container">
      <TransactionHeader
        pendingOpsCount={pendingOpsCount}
        onLogout={handleLogout}
      />
      <div className="square-b">
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "0px",
          }}
        >
          Welcome back
        </h1>
      </div>
      <div ref={elCRef}>
        <p style={{ fontSize: "24px", fontWeight: "normal", marginTop: "0px" }}>
          {name}
        </p>
      </div>

      <IonContent>
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

export default Transactions;
