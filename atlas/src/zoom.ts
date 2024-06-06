import { Base } from "@/base";
import { IZoomAccount } from "@litespace/types";

export class Zoom extends Base {
  async createAccount(
    params: IZoomAccount.CreatePayload
  ): Promise<IZoomAccount.Self> {
    const { data } = await this.client.post<IZoomAccount.Self>(
      "/api/v1/zoom/account",
      JSON.stringify(params)
    );
    return data;
  }

  async updateAccount(
    id: number,
    params: IZoomAccount.UpdatePayload
  ): Promise<void> {
    await this.client.put(`/api/v1/zoom/account/${id}`, JSON.stringify(params));
  }

  async deleteAccount(id: number): Promise<void> {
    await this.client.put(`/api/v1/zoom/account/${id}`);
  }

  async findAccountById(id: number): Promise<IZoomAccount.Self> {
    return await this.client
      .get<IZoomAccount.Self>(`/api/v1/zoom/account/${id}`)
      .then((response) => response.data);
  }

  async findAllAccounts(): Promise<IZoomAccount.Self[]> {
    return await this.client
      .get<IZoomAccount.Self[]>("/api/v1/zoom/account/list")
      .then((response) => response.data);
  }
}
