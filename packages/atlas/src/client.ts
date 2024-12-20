import { Backend } from "@litespace/types";
import axios, { AxiosError, AxiosInstance } from "axios";

export enum TokenType {
  Bearer = "Bearer",
  Basic = "Basic",
}

export type AuthToken = { type: TokenType; value: string };

export const sockets = {
  main: {
    [Backend.Local]: `ws://localhost:8080`,
    [Backend.Staging]: "wss://api.staging.litespace.org",
    [Backend.Production]: "wss://api.litespace.org",
  },
} as const;

export const backends = {
  main: {
    [Backend.Local]: "http://localhost:8080",
    [Backend.Staging]: "https://api.staging.litespace.org",
    [Backend.Production]: "https://api.litespace.org",
  },
};

export const peers = {
  [Backend.Local]: {
    host: "localhost",
    port: 7070,
    secure: false,
    key: "peer",
    path: "/ls",
  },
  [Backend.Staging]: {
    host: "peer.staging.litespace.org",
    port: 443,
    secure: true,
    key: "peer",
    path: "/ls",
  },
  [Backend.Production]: {
    host: "peer.litespace.org",
    port: 443,
    secure: true,
    key: "peer",
    path: "/ls",
  },
} as const;

export function createClient(
  backend: Backend,
  token: AuthToken | null
): AxiosInstance {
  const client = axios.create({
    baseURL: backends.main[backend],
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
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
