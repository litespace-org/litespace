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

export type AuthToken =
  | { type: TokenType.Bearer; value: string }
  | { type: TokenType.Basic; username: string; password: string };

export const sockets: Record<
  "main" | "echo" | "livekit",
  Record<Env.Server, string>
> = {
  main: {
    local: `ws://localhost:4000`,
    staging: "wss://api.staging.litespace.org",
    production: "wss://api.litespace.org",
  },
  echo: {
    local: `ws://localhost:4004`,
    staging: "wss://echo.staging.litespace.org",
    production: "wss://echo.litespace.org",
  },
  livekit: {
    local: `ws://localhost:7880`,
    staging: "wss://livekit.staging.litespace.org",
    production: "wss://livekit.litespace.org",
  },
} as const;

export type Server = "api" | "messenger" | "echo";

export const servers: Record<Server, Record<Env.Server, string>> = {
  api: {
    local: "http://localhost:4000",
    staging: "https://api.staging.litespace.org",
    production: "https://api.litespace.org",
  },
  messenger: {
    local: "http://localhost:4002",
    staging: "https://messenger.staging.litespace.org",
    production: "https://messenger.litespace.org",
  },
  echo: {
    local: "http://localhost:4004",
    staging: "https://echo.staging.litespace.org",
    production: "https://echo.litespace.org",
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

export function encodeToken(token: AuthToken): string {
  const value =
    token.type === TokenType.Bearer
      ? token.value
      : Buffer.from(
          [token.username, token.password].join(":"),
          "utf-8"
        ).toString("base64");

  return `${token.type} ${value}`;
}

export function createClient(
  server: Server,
  env: Env.Server,
  token: AuthToken | null
): AxiosInstance {
  const client = axios.create({
    baseURL: servers[server][env],
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = encodeToken(token);
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
