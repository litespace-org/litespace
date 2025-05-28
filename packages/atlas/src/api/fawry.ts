import { Base } from "@/lib/base";
import { IFawry } from "@litespace/types";

export class Fawry extends Base {
  public async payWithCard(
    payload: IFawry.PayWithCardPayload
  ): Promise<IFawry.PayWithCardResponse> {
    return await this.post({ route: "/api/v1/fawry/pay/card", payload });
  }

  public async payWithRefNum(
    payload: IFawry.PayWithRefNumPayload
  ): Promise<IFawry.PayWithRefNumResponse> {
    return await this.post({ route: "/api/v1/fawry/pay/ref-num", payload });
  }

  public async payWithEWallet(
    payload: IFawry.PayWithEWalletPayload
  ): Promise<IFawry.PayWithEWalletResponse> {
    return await this.post({ route: "/api/v1/fawry/pay/e-wallet", payload });
  }

  public async payWithBankInstallments(
    payload: IFawry.PayWithBankInstallmentsPayload
  ): Promise<IFawry.PayWithBankInstallmentsResponse> {
    return await this.post({
      route: "/api/v1/fawry/pay/bank-installments",
      payload,
    });
  }

  public async cancelUnpaidOrder(
    payload: IFawry.CancelUnpaidOrderPayload
  ): Promise<IFawry.CancelUnpaidOrderResponse> {
    return await this.post({
      route: "/api/v1/fawry/cancel-unpaid-order",
      payload,
    });
  }

  public async refund(
    payload: IFawry.RefundPayload
  ): Promise<IFawry.RefundResponse> {
    return await this.post({ route: "/api/v1/fawry/refund", payload });
  }

  public async findCardTokens(
    query: IFawry.FindCardTokensApiQuery
  ): Promise<IFawry.FindCardTokensResponse> {
    return await this.get({
      route: "/api/v1/fawry/card-token/list",
      params: query,
    });
  }

  public async deleteCardToken(
    payload: IFawry.DeleteCardTokenPayload
  ): Promise<IFawry.DeleteCardTokenResponse> {
    return await this.del({
      route: "/api/v1/fawry/card-token",
      payload,
    });
  }

  public async getAddCardTokenUrl(): Promise<IFawry.GetAddCardTokenUrlResponse> {
    return this.get({ route: "/api/v1/fawry/card-token/url" });
  }

  public async getPaymentStatus(
    params: IFawry.GetPaymentStatusPayload
  ): Promise<IFawry.GetPaymentStatusResponse> {
    return this.get({ route: "/api/v1/fawry/payment-status", params });
  }

  public async syncPaymentStatus(
    payload: IFawry.SyncPaymentStatusPayload
  ): Promise<IFawry.SyncPaymentStatusResponse> {
    return await this.post({
      route: "/api/v1/fawry/payment-status/sync",
      payload,
    });
  }
}
