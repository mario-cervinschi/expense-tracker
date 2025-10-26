import { Transaction } from "../models/transaction";
import { usePreferences } from "./usePreferences";

export interface PendingOperation {
  type: "create" | "update" | "delete";
  payload: Transaction | { id: number | string };
  timestamp: number;
}

const PENDING_OPS_KEY = "pendingOperations";
const TRANSACTIONS_CACHE_KEY = "transactionsCache";

export const useStorageService = () => {
  const { get, set } = usePreferences();

  const getPendingOperations = async (): Promise<PendingOperation[]> => {
    const value = await get(PENDING_OPS_KEY);
    return value ? (JSON.parse(value) as PendingOperation[]) : [];
  };

  const setPendingOperations = async (
    operations: PendingOperation[]
  ): Promise<void> => {
    await set(PENDING_OPS_KEY, JSON.stringify(operations));
  };

  const addPendingOperation = async (
    operation: PendingOperation
  ): Promise<void> => {
    const ops = await getPendingOperations();
    ops.push(operation);
    await setPendingOperations(ops);
  };

  const saveTransactionsCache = async (
    transactions: Transaction[]
  ): Promise<void> => {
    await set(TRANSACTIONS_CACHE_KEY, JSON.stringify(transactions));
  };

  const getTransactionsCache = async (): Promise<Transaction[]> => {
    const value = await get( TRANSACTIONS_CACHE_KEY );
    const txs = value ? (JSON.parse(value) as Transaction[]) : [];
    return txs.map((t) => ({ ...t, date: new Date(t.date) }));
  };

  return {
    getPendingOperations,
    setPendingOperations,
    addPendingOperation,
    saveTransactionsCache,
    getTransactionsCache,
  };
};


