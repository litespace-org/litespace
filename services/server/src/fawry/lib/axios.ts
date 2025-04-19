import axios, { AxiosInstance } from "axios";
import { Environment } from "@/constants";
import {
  FAWRY_API_URL_PROD,
  FAWRY_API_URL_STAGING,
} from "@/fawry/constants/urls";

export function createClient(env: Environment): AxiosInstance {
  const client = axios.create({
    baseURL:
      env == Environment.Production
        ? FAWRY_API_URL_PROD
        : FAWRY_API_URL_STAGING,
    headers: {
      "Content-Type": "application/json",
      Connection: "keep-alive",
    },
    timeout: 1000 * 10000,
  });
  return client;
}

type HTTPMethodAttr<T, P = object> = {
  route: string;
  payload?: T;
  params?: P;
};

export class Base {
  constructor(public readonly client: AxiosInstance) {}

  async post<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .post(attr.route, attr.payload ? JSON.stringify(attr.payload) : undefined)
      .then((response) => response.data);
  }

  async put<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .put(attr.route, JSON.stringify(attr.payload))
      .then((response) => response.data);
  }

  async patch<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .patch(attr.route, JSON.stringify(attr.payload))
      .then((response) => response.data);
  }

  async del<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .delete(attr.route, {
        data: attr.payload,
        params: attr.params,
      })
      .then((response) => response.data);
  }

  async get<T, R = void, P = object>(attr: HTTPMethodAttr<T, P>): Promise<R> {
    return this.client
      .get<R>(attr.route, {
        data: JSON.stringify(attr.payload),
        params: attr.params,
      })
      .then((response) => response.data);
  }
}
