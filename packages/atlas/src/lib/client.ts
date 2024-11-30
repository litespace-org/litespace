import axios, { AxiosError, AxiosInstance } from "axios";

import { Backend } from "@litespace/types";
import { GetToken } from "@/types";
import { backends } from "@/configs";

export function createClient(
  backend: Backend,
  getToken: GetToken
): AxiosInstance {
  const client = axios.create({
    baseURL: backends.main[backend],
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `${token.type} ${token.value}`;
    return config;
  });

  client.interceptors.response.use(undefined, (error: AxiosError) => {
    const data = error.response?.data;
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : null;

    if (message) return Promise.reject(new Error(message));

    return Promise.reject(error);
  });

  return client;
}
