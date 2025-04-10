import { environment } from "@/constants";
import { Base, createClient } from "@/fawry/lib/axios";
import { Requests, Responses } from "@/fawry/types";
import { Paths } from "@/fawry/constants";

class Api extends Base {
  async payWithCard(
    payload: Requests.PayWithCardPayload
  ): Promise<Responses.PayWithCardResponse> {
    return await this.post({ route: Paths.PAY_WITH_CARD, payload });
  }

  async payWithRefNum(
    payload: Requests.PayWithRefNumPayload
  ): Promise<Responses.PayWithRefNumResponse> {
    return await this.post({ route: Paths.PAY_WITH_REFNUM, payload });
  }

  async payWithEWallet(
    payload: Requests.PayWithEWalletPayload
  ): Promise<Responses.PayWithEWalletResponse> {
    return await this.post({ route: Paths.PAY_WITH_EWALLET, payload });
  }

  async payWithBankInstallments(
    payload: Requests.PayWithCardAndBankInstallmentsPayload
  ): Promise<Responses.PayWithCardAndBankInstallmentsResponse> {
    return await this.post({
      route: Paths.PAY_WITH_BANK_INSTALLMENTS,
      payload,
    });
  }

  async authorizePayment(
    payload: Requests.AuthorizePaymentPayload
  ): Promise<Responses.AuthorizePaymentResponse> {
    return await this.post({ route: Paths.AUTHORIZE_PAYMENT, payload });
  }

  async capturePayment(
    payload: Requests.CapturePaymentPayload
  ): Promise<Responses.CapturePaymentResponse> {
    return await this.post({ route: Paths.CAPTURE_PAYMENT, payload });
  }

  async cancelAuthPayment(
    payload: Requests.CancelPaymentAuthPayload
  ): Promise<Responses.CancelPaymentAuthResponse> {
    return await this.post({ route: Paths.CANCEL_AUTHORIZED_PAYMENT, payload });
  }

  async getPaymentStatus(
    payload: Requests.GetPaymentStatusPayload
  ): Promise<Responses.GetPaymentStatusResponse> {
    return await this.get({ route: Paths.GET_PAYMENT_STATUS(payload) });
  }

  async cancelUnpaidOrder(
    payload: Requests.CancelUnpaidOrderPayload
  ): Promise<Responses.CancelUnpaidOrderResponse> {
    return await this.post({ route: Paths.CANCEL_UNPAID_ORDER, payload });
  }

  async refund(
    payload: Requests.RefundPayload
  ): Promise<Responses.RefundResponse> {
    return await this.post({ route: Paths.REFUND, payload });
  }

  async createCardTokenV1(
    payload: Requests.CreateCardTokenPayload
  ): Promise<Responses.CreateCardTokenResponse> {
    return await this.post({ route: Paths.CREATE_CARD_TOKEN_V1, payload });
  }

  /**
   * this can be a mistake in the docs: https://developer.fawrystaging.com/docs/card-tokens/create-use-token
   */
  async createCardTokenV2(
    payload: Requests.CreateCardTokenPayload
  ): Promise<Responses.CreateCardTokenResponse> {
    return await this.post({ route: Paths.CREATE_CARD_TOKEN_V2, payload });
  }

  async listCardTokens(
    payload: Requests.ListCardTokensPayload
  ): Promise<Responses.ListCardTokensResponse> {
    return await this.get({ route: Paths.LIST_CARD_TOKENS(payload) });
  }

  async deleteCardToken(
    payload: Requests.DeleteCardTokenPayload
  ): Promise<Responses.DeleteCardTokenResponse> {
    return await this.del({ route: Paths.DELETE_CARD_TOKEN, payload });
  }
}

export const FawryApi = new Api(createClient(environment));
