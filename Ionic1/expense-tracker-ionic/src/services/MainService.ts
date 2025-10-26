import axios from "axios";
import { Transaction } from "../models/transaction";

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const baseURL = isLocalhost
  ? "http://localhost:3000"
  : "http://192.168.1.130:3000";

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const transformTransactionDate = (transaction: any): Transaction => ({
  ...transaction,
  date: new Date(transaction.date),
});

export const getAllTransactions = async (): Promise<Transaction[]> => {
    const response = await apiClient.get("item");
    return response.data.map(transformTransactionDate);
}

export const deleteTransactionById = async (id: number): Promise<void> => {
    await apiClient.delete(`/item/${id}`);
}

export const updateTransaction = async (transaction: Transaction): Promise<Transaction> => {
    const response = await apiClient.put(`/item/${transaction.id}`, transaction);
    return transformTransactionDate(response.data);
}

export const createTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const response = await apiClient.post('/item', transaction);
    return transformTransactionDate(response.data);
}


