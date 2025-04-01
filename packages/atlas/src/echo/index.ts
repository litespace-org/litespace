import { AuthToken, createClient } from "@/lib/client";
import { Env, IEcho } from "@litespace/types";
import { AxiosInstance } from "axios";

export class Echo {
  public readonly client: AxiosInstance;

  constructor(server: Env.Server, token: AuthToken | null) {
    this.client = createClient("echo", server, token);
  }

  async produce(
    payload: IEcho.ProducePayload
  ): Promise<IEcho.ProduceApiResponse> {
    return this.client
      .post<IEcho.ProduceApiResponse>("/produce", payload)
      .then((res) => res.data);
  }

  async consume(
    payload: IEcho.ConsumePayload
  ): Promise<IEcho.ConsumeApiResponse> {
    return this.client
      .post<IEcho.ConsumeApiResponse>("/consume", payload)
      .then((res) => res.data);
  }
}
