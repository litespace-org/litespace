import { Backend } from "@litespace/types";
import axios, { AxiosError, AxiosInstance } from "axios";

export type GetToken = () => string | null;

export const sockets = {
  recorder: {
    [Backend.Local]: "ws://localhost:9090",
    [Backend.Staging]: "wss://recorder.staging.litespace.com",
    [Backend.Production]: "wss://recorder.litespace.com",
  },
  main: {
    [Backend.Local]: `ws://localhost:8080`,
    [Backend.Staging]: "wss://api.litespace.com",
    [Backend.Production]: "wss://api.staging.litespace.com",
  },
} as const;

export const backends = {
  main: {
    [Backend.Local]: "http://localhost:8080",
    [Backend.Staging]: "https://api.staging.litespace.org",
    [Backend.Production]: "https://api.litespace.org",
  },
  recorder: {
    [Backend.Local]: "http://localhost:9090",
    [Backend.Staging]: "https://recorder.staging.litespace.com",
    [Backend.Production]: "https://recorder.litespace.com",
  },
};

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
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
