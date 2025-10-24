import { Preferences } from '@capacitor/preferences';
import { Transaction } from '../models/transaction';

export interface PendingOperation {
  type: 'create' | 'update' | 'delete';
  payload: Transaction | { id: number | string };
  timestamp: number;
}

const PENDING_OPS_KEY = 'pendingOperations';
const TRANSACTIONS_CACHE_KEY = 'transactionsCache';

export const getPendingOperations = async (): Promise<PendingOperation[]> => {
  const { value } = await Preferences.get({ key: PENDING_OPS_KEY });
  return value ? (JSON.parse(value) as PendingOperation[]) : [];
};

export const setPendingOperations = async (operations: PendingOperation[]): Promise<void> => {
  await Preferences.set({
    key: PENDING_OPS_KEY,
    value: JSON.stringify(operations),
  });
};

export const addPendingOperation = async (operation: PendingOperation): Promise<void> => {
  const ops = await getPendingOperations();
  ops.push(operation);
  await setPendingOperations(ops);
};

export const saveTransactionsCache = async (transactions: Transaction[]): Promise<void> => {
  await Preferences.set({
    key: TRANSACTIONS_CACHE_KEY,
    value: JSON.stringify(transactions),
  });
};

export const getTransactionsCache = async (): Promise<Transaction[]> => {
  const { value } = await Preferences.get({ key: TRANSACTIONS_CACHE_KEY });
  const txs = value ? (JSON.parse(value) as Transaction[]) : [];
  return txs.map(t => ({ ...t, date: new Date(t.date) }));
};