import { Backend } from "@litespace/types";

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

