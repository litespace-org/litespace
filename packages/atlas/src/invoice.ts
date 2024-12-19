import { Base } from "@/base";
import { IInvoice, Paginated } from "@litespace/types";
import { safeFormData } from "@/lib/form";

export class Invoice extends Base {
  async create(payload: IInvoice.CreateApiPayload): Promise<IInvoice.Self> {
    return await this.post({
      route: "/api/v1/invoice", 
      payload
    });
  }

  async stats(userId: number): Promise<IInvoice.StatsApiResponse> {
    return await this.get({ route: `/api/v1/invoice/stats/${userId}` });
  }

  async updateByReceiver(
    invoiceId: number,
    payload: IInvoice.UpdateByReceiverApiPayload
  ): Promise<void> {
    return await this.put({
      route: `/api/v1/invoice/receiver/${invoiceId}`,
      payload,
    });
  }

  async updateByAdmin(
    invoiceId: number,
    payload: IInvoice.UpdateByAdminApiPayload & { receipt?: File }
  ): Promise<void> {
    const { append, done } = safeFormData<
      IInvoice.UpdateByAdminApiPayload & { receipt?: File }
    >();

    append("note", payload.note);
    append("receipt", payload.receipt);
    append("status", payload.status);

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    } as const;

    return await this.client.put(
      `/api/v1/invoice/admin/${invoiceId}`,
      done(),
      config
    );
  }

  async find(
    params: IInvoice.FindInvoicesQuery
  ): Promise<Paginated<IInvoice.Self>> {
    return this.get({
      route: "/api/v1/invoice/list",
      params,
    });
  }

  async cancel(invoiceId: number): Promise<void> {
    return this.del({ route: `/api/v1/invoice/${invoiceId}` });
  }
}
