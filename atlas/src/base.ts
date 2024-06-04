import { Backend } from "@litespace/types";
import { AxiosInstance } from "axios";
import { createClient } from "@/client";

export class Base {
  public readonly client: AxiosInstance;

  constructor(backend: Backend) {
    this.client = createClient(backend);
  }
}
