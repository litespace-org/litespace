import { Backend } from "@litespace/types";
import axios, { AxiosInstance } from "axios";

export const backendUrls: Record<Backend, string> = {
  [Backend.Local]: "http://localhost:8080",
  [Backend.Staging]: "https://moon.litespace.com",
  [Backend.Production]: "https://mars.litespace.com",
};

export function createClient(backend: Backend): AxiosInstance {
  return axios.create({
    baseURL: backendUrls[backend],
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
