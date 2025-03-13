import { ApiErrorCode, Env } from "@litespace/types";
import {
  ResponseError,
  isApiError,
  isFieldError,
} from "@litespace/utils/error";
import axios, { AxiosError, AxiosInstance } from "axios";

export enum TokenType {
  Bearer = "Bearer",
  Basic = "Basic",
}

export type AuthToken = { type: TokenType; value: string };

export const sockets: Record<"main", Record<Env.Server, string>> = {
  main: {
    local: `ws://localhost:4000`,
    staging: "wss://api.staging.litespace.org",
    production: "wss://api.litespace.org",
  },
} as const;

export const servers: Record<"main", Record<Env.Server, string>> = {
  main: {
    local: "http://localhost:4000",
    staging: "https://api.staging.litespace.org",
    production: "https://api.litespace.org",
  },
};

export const peers: Record<
  Env.Server,
  { host: string; port: number; secure: boolean; key: string; path: string }
> = {
  local: {
    host: "localhost",
    port: 4001,
    secure: false,
    key: "peer",
    path: "/ls",
  },
  staging: {
    host: "peer.staging.litespace.org",
    port: 443,
    secure: true,
    key: "peer",
    path: "/ls",
  },
  production: {
    host: "peer.litespace.org",
    port: 443,
    secure: true,
    key: "peer",
    path: "/ls",
  },
} as const;

export function createClient(
  server: Env.Server,
  token: AuthToken | null
): AxiosInstance {
  const client = axios.create({
    baseURL: servers.main[server],
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `${token.type} ${token.value}`;
    return config;
  });

  client.interceptors.response.use(null, (error: AxiosError) => {
    const data = error.response?.data;

    if (!error.response || !data || typeof data !== "object")
      return Promise.reject(error);

    const code: ApiErrorCode | null =
      "code" in data && (isApiError(data.code) || isFieldError(data.code))
        ? data.code
        : null;

    if (code)
      return Promise.reject(
        new ResponseError({
          errorCode: code,
          statusCode: error.response.status,
        })
      );

    return Promise.reject(error);
  });

  return client;
}
