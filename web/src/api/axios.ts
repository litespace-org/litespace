import axios from "axios";
import { api } from "@/api/url";

export const client = axios.create({
  baseURL: api,
  headers: {
    "Content-Type": "application/json",
  },
});
