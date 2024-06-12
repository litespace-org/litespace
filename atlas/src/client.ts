import { Backend } from "@litespace/types";
import axios, { AxiosInstance } from "axios";

const hostname = window.location.hostname;

export const backendApiUrls: Record<Backend, string> = {
  [Backend.Local]: `http://${hostname}:8080`,
  [Backend.Staging]: "https://moon.litespace.com",
  [Backend.Production]: "https://mars.litespace.com",
};

export const backendSockets = {
  [Backend.Local]: `ws://${hostname}:8080`,
  [Backend.Staging]: "wss://moon.litespace.com",
  [Backend.Production]: "wss://mars.litespace.com",
};

export function createClient(backend: Backend): AxiosInstance {
  return axios.create({
    baseURL: backendApiUrls[backend],
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
}
