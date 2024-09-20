import { Base } from "@/base";
import { IInvoice, Paginated } from "@litespace/types";

export class Invoice extends Base {
  async create(payload: IInvoice.CreateApiPayload): Promise<IInvoice.Self> {
    return await this.post("/api/v1/invoice", payload);
  }

  async stats(userId: number): Promise<IInvoice.StatsApiResponse> {
    return await this.get(`/api/v1/invoice/stats/${userId}`);
  }

  async updateByReceiver(
    invoiceId: number,
    payload: IInvoice.UpdateByReceiverApiPayload
  ): Promise<void> {
    return await this.put(`/api/v1/invoice/receiver/${invoiceId}`, payload);
  }

  async updateByAdmin(
    invoiceId: number,
    payload: IInvoice.UpdateByAdminApiPayload
  ): Promise<void> {
    return await this.put(`/api/v1/invoice/admin/${invoiceId}`, payload);
  }

  async find(
    params: IInvoice.FindInvoicesParams
  ): Promise<Paginated<IInvoice.Self>> {
    return this.get("/api/v1/invoice/list", null, params);
  }

  async cancel(invoiceId: number): Promise<void> {
    return this.del(`/api/v1/invoice/${invoiceId}`);
  }
}
