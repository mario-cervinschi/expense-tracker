import { Transaction } from "../models/transaction";
import { apiClient } from "./client";

export const PAGE_LIMIT = 10;

const transformTransactionDate = (transaction: any): Transaction => ({
  ...transaction,
  date: new Date(transaction.date),
});

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const response = await apiClient.get("/item");
  return response.data.map(transformTransactionDate);
};

export const getFilteredPagedTransactions = async (
  page: number,
  filter: string
): Promise<Transaction[]> => {
  const response = await apiClient.get(`/item/filter/${filter}`, {
    params: {
      page: page,
      limit: PAGE_LIMIT,
    },
  });

  return response.data.data.map(transformTransactionDate);
};

export const getPagedTransactions = async (
  page: number
): Promise<Transaction[]> => {
  const response = await apiClient.get("/item", {
    params: {
      page: page,
      limit: PAGE_LIMIT,
    },
  });
  return response.data.data.map(transformTransactionDate);
};

export const deleteTransactionById = async (
  id: number | string
): Promise<void> => {
  await apiClient.delete(`/item/${id}`);
};

export const updateTransaction = async (
  transaction: Transaction
): Promise<Transaction> => {
  const response = await apiClient.put(`/item/${transaction._id}`, transaction);
  return transformTransactionDate(response.data);
};

export const createTransaction = async (
  transaction: Transaction
): Promise<Transaction> => {
  const { _id, ...newTransactionData } = transaction;

  const response = await apiClient.post("/item", newTransactionData);
  return transformTransactionDate(response.data);
};
