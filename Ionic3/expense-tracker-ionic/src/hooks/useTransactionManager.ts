import { useState, useEffect } from "react";
import { useIonToast } from "@ionic/react";
import { Transaction } from "../models/transaction";
import * as MainService from "../services/MainService";
import { useNetwork } from "./useNetwork";
import { useStorageService } from "./useStorageService";
import { MyPhoto, usePhotos } from "./usePhotos";

export const useTransactionManager = (searchExpense: string) => {
  const { networkStatus } = useNetwork();
  const [present] = useIonToast();
  const {
    getPendingOperations,
    setPendingOperations,
    addPendingOperation,
    saveTransactionsCache,
    getTransactionsCache,
  } = useStorageService();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [pendingOpsCount, setPendingOpsCount] = useState(0);
  const {deletePhoto} = usePhotos();

  const fetchTransactions = async (filter?: string, forceApi = false) => {
    if (!networkStatus.connected && (filter || page > 1)) {
      setLoading(false);
      return;
    }
    if (!networkStatus.connected && !forceApi) {
      try {
        setLoading(true);
        present({
          message: "Offline. Getting local data",
          duration: 1500,
          color: "secondary",
        });
        const data = await getTransactionsCache();
        setTransactions(data);
        setPage(1);
        setHasMorePages(false);
        setError(null);
      } catch (cacheErr) {
        setError("Could not load local data.");
        console.error(cacheErr);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      let data;
      if (filter && filter.trim()) {
        data = await MainService.getFilteredPagedTransactions(1, filter.trim());
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
      await saveTransactionsCache(formattedData);
    } catch (err) {
      setError("Failed to fetch transactions. Trying local cache.");
      console.error(err);
      try {
        const data = await getTransactionsCache();
        setTransactions(data);
        setPage(1);
        setHasMorePages(false);
      } catch (cacheErr) {
        setError("Failed to fetch transactions and cache is unavailable.");
      }
    } finally {
      setLoading(false);
    }
  };

  const syncOfflineData = async () => {
    const pendingOps = await getPendingOperations();
    if (pendingOps.length === 0) {
      return;
    }

    present({
      message: `Syncing ${pendingOps.length} items...`,
      duration: 2000,
      color: "secondary",
    });

    let remainingOps = [...pendingOps];
    let syncSuccess = true;

    for (const op of pendingOps) {
      try {
        if (op.type === "create") {
          await MainService.createTransaction(op.payload as Transaction);
        } else if (op.type === "update") {
          await MainService.updateTransaction(op.payload as Transaction);
        } else if (op.type === "delete") {
          await MainService.deleteTransactionById(
            (op.payload as { id: string | number }).id
          );
        }
        remainingOps = remainingOps.filter((o) => o.timestamp !== op.timestamp);
      } catch (err) {
        console.error("Error on syncing:", op, err);
        present({
          message: "Sync failed. Try later.",
          duration: 3000,
          color: "danger",
        });
        syncSuccess = false;
        break;
      }
    }

    await setPendingOperations(remainingOps);
    setPendingOpsCount(remainingOps.length);

    if (syncSuccess && remainingOps.length === 0) {
      present({
        message: "Sync complete",
        duration: 2000,
        color: "success",
      });
      await fetchTransactions(searchExpense, true);
    }
  };

  const onDeleteClick = async (itemId: number | string) => {
    if (networkStatus.connected) {
      try {
        await MainService.deleteTransactionById(itemId);
        present({
          message: "Deleted on server.",
          duration: 2000,
          color: "success",
        });
        return;
      } catch (err) {
        console.warn("Deleting on server failed. Operation done locally", err);
      }
    }

    present({
      message: "Local delete only. Waiting for internet connection.",
      duration: 2000,
      color: "warning",
    });
    await addPendingOperation({
      type: "delete",
      payload: { id: itemId },
      timestamp: Date.now(),
    });
    setPendingOpsCount((prev) => prev + 1);
    setTransactions((prev) => prev.filter((t) => t._id !== itemId));
  };

  const handleSave = async (updatedTransaction: Transaction,
    photoToDelete?: MyPhoto) => {
      if (photoToDelete) {
        try {
          await deletePhoto(photoToDelete);
          console.log("Photo deleted from local storage:", photoToDelete.filepath);
        } catch (err) {
          console.error("Failed to delete photo from local storage:", err);
        }
      }

    const isUpdate = !!updatedTransaction._id;

    if (networkStatus.connected) {
      try {
        if (isUpdate) {
          await MainService.updateTransaction(updatedTransaction);
        } else {
          await MainService.createTransaction(updatedTransaction);
        }
        present({
          message: "Saved on server",
          duration: 2000,
          color: "success",
        });
        return true;
      } catch (err) {
        console.warn("Saving locally.", err);
        throw err;
      }
    }

    present({
      message: "Saved locally",
      duration: 2000,
      color: "warning",
    });
    const opType = isUpdate ? "update" : "create";
    let txToSave = { ...updatedTransaction };

    if (!isUpdate) {
      txToSave._id = `temp_${Date.now()}`;
    }

    await addPendingOperation({
      type: opType,
      payload: txToSave,
      timestamp: Date.now(),
    });
    setPendingOpsCount((prev) => prev + 1);

    if (isUpdate) {
      setTransactions((prev) =>
        prev.map((t) => (t._id === txToSave._id ? txToSave : t))
      );
    } else {
      setTransactions((prev) => [txToSave, ...prev]);
    }

    return true;
  };

  const handleInfiniteScroll = async (event: CustomEvent<void>) => {
    if (!networkStatus.connected) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }
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
            currentTransactions.filter(
              (t) => String(t._id) !== String(payloadWithDate._id)
            )
          );
          break;
        default:
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    getPendingOperations().then((ops) => setPendingOpsCount(ops.length));
    fetchTransactions();

    return () => {
      console.log("Closing WebSocket connection");
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (networkStatus.connected) {
      fetchTransactions(searchExpense);
    } else {
      fetchTransactions(searchExpense);
    }
  }, [searchExpense, networkStatus.connected]);

  useEffect(() => {
    if (networkStatus.connected) {
      console.log("Online. Syncing offline data.");
      syncOfflineData();
    }
  }, [networkStatus.connected]);

  return {
    transactions,
    loading,
    error,
    pendingOpsCount,
    hasMorePages,
    onDeleteClick,
    handleSave,
    handleInfiniteScroll,
  };
};
