import { Backend } from "@litespace/types";
import axios, { AxiosInstance } from "axios";

const backendUrl: Record<Backend, string> = {
  [Backend.Local]: "http://localhost:8080/",
  [Backend.Staging]: "https://moon.litespace.com",
  [Backend.Production]: "https://mars.litespace.com",
};

export function createClient(backend: Backend): AxiosInstance {
  return axios.create({
    baseURL: backendUrl[backend],
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
