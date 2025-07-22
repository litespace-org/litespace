import { Base } from "@/lib/base";
import { IInvoice, Paginated } from "@litespace/types";

export class Invoice extends Base {
  async create(payload: IInvoice.CreateApiPayload): Promise<IInvoice.Self> {
    return await this.post({
      route: "/api/v1/invoice",
      payload,
    });
  }

  async stats(userId: number): Promise<IInvoice.StatsApiResponse> {
    return await this.get({ route: `/api/v1/invoice/stats/${userId}` });
  }

  async find(
    params: IInvoice.FindInvoicesQuery
  ): Promise<Paginated<IInvoice.Self>> {
    return this.get({
      route: "/api/v1/invoice",
      params,
    });
  }

  async update(
    invoiceId: number,
    payload: IInvoice.UpdateApiPayload
  ): Promise<void> {
    return this.put({
      route: `/api/v1/invoice/${invoiceId}/with/asset`,
      payload,
    });
  }
}
