import { Backend } from "@litespace/types";
import axios, { AxiosError, AxiosInstance } from "axios";

export const backendApiUrls: Record<Backend, string> = {
  [Backend.Local]: `http://localhost:8080`,
  [Backend.Staging]: "https://moon.litespace.com",
  [Backend.Production]: "https://mars.litespace.com",
};

export const backendSockets = {
  [Backend.Local]: `ws://localhost:8080`,
  [Backend.Staging]: "wss://moon.litespace.com",
  [Backend.Production]: "wss://mars.litespace.com",
};

export function createClient(backend: Backend): AxiosInstance {
  const client = axios.create({
    baseURL: backendApiUrls[backend],
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
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
