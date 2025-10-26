import { AuthData } from "../models/auth";
import { apiClient } from "./client";

export const userLogin = async (user: AuthData): Promise<{ token: string }> => {
  const response = await apiClient.post(`/auth/login`, user);
  // console.log(response);
  return response.data;
};

export const userRegister = async (
  user: AuthData
): Promise<{ token: string }> => {
  const response = await apiClient.post(`/auth/signup`, user);
  // console.log(response);
  return response.data;
};
