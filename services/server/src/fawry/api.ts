import { environment, fawryConfig } from "@/constants";
import { Base, createClient } from "@/fawry/lib/axios";
import { Requests, Responses } from "@/fawry/types";
import { FAWRY_ROUTES } from "@/fawry/constants";
import { genSignature } from "@/fawry/lib";
import { forgeFawryPayload } from "@/lib/fawry";

class Api extends Base {
  async payWithCardToken({
    transactionId,
    amount,
    cardToken,
    cvv,
    customer,
  }: {
    transactionId: number;
    amount: number;
    cardToken: string;
    cvv: number;
    customer: Requests.Customer;
  }): Promise<Responses.PayWithCardResponse> {
    const signature = genSignature.forPayWithCard({
      amount,
      cardToken,
      customerProfileId: customer.id,
      merchantRefNum: transactionId,
      cvv,
      returnUrl: "https://google.com/",
    });

    const base = forgeFawryPayload({
      merchantRefNum: transactionId,
      paymentMethod: "CARD",
      amount,
      signature,
      customer,
      chargeItems: [
        {
          itemId: "1",
          description: "Desc",
          price: 100,
          quantity: 1,
        },
      ],
      description: "Description",
    });

    const payload: Requests.PayWithCardPayload = {
      ...base,
      paymentMethod: "CARD",
      cardToken,
      cvv,
      enable3DS: true,
      authCaptureModePayment: true,
      returnUrl: "https://google.com/",
    };

    return await this.post({ route: FAWRY_ROUTES.PAY_WITH_CARD, payload });
  }

  async payWithRefNum(
    payload: Requests.PayWithRefNumPayload
  ): Promise<Responses.PayWithRefNumResponse> {
    return await this.post({ route: FAWRY_ROUTES.PAY_WITH_REFNUM, payload });
  }

  async payWithEWallet(
    payload: Requests.PayWithEWalletPayload
  ): Promise<Responses.PayWithEWalletResponse> {
    return await this.post({ route: FAWRY_ROUTES.PAY_WITH_EWALLET, payload });
  }

  async payWithBankInstallments(
    payload: Requests.PayWithCardAndBankInstallmentsPayload
  ): Promise<Responses.PayWithCardAndBankInstallmentsResponse> {
    return await this.post({
      route: FAWRY_ROUTES.PAY_WITH_BANK_INSTALLMENTS,
      payload,
    });
  }

  async authorizePayment(
    payload: Requests.AuthorizePaymentPayload
  ): Promise<Responses.AuthorizePaymentResponse> {
    return await this.post({ route: FAWRY_ROUTES.AUTHORIZE_PAYMENT, payload });
  }

  async capturePayment(
    payload: Requests.CapturePaymentPayload
  ): Promise<Responses.CapturePaymentResponse> {
    return await this.post({ route: FAWRY_ROUTES.CAPTURE_PAYMENT, payload });
  }

  async cancelAuthPayment(
    payload: Requests.CancelPaymentAuthPayload
  ): Promise<Responses.CancelPaymentAuthResponse> {
    return await this.post({
      route: FAWRY_ROUTES.CANCEL_AUTHORIZED_PAYMENT,
      payload,
    });
  }

  async getPaymentStatus(
    merchantRefNumber: number
  ): Promise<Responses.GetPaymentStatusResponse> {
    const id = merchantRefNumber.toString();

    const payload: Requests.GetPaymentStatusPayload = {
      merchantCode: fawryConfig.merchantCode,
      merchantRefNumber: id,
      signature: genSignature.forGetPaymentStatus(id),
    };

    return await this.get({
      route: FAWRY_ROUTES.GET_PAYMENT_STATUS,
      params: payload,
    });
  }

  async cancelUnpaidOrder(
    orderRefNumber: string
  ): Promise<Responses.CancelUnpaidOrderResponse> {
    const lang = "ar-eg";
    const payload: Requests.CancelUnpaidOrderPayload = {
      signature: genSignature.forCancelUnpaidOrderRequest({
        orderRefNo: orderRefNumber,
        lang,
      }),
      merchantAccount: fawryConfig.merchantCode,
      orderRefNo: orderRefNumber,
      lang,
    };
    return await this.post({
      route: FAWRY_ROUTES.CANCEL_UNPAID_ORDER,
      payload,
    });
  }

  async refund(
    payload: Requests.RefundPayload
  ): Promise<Responses.RefundResponse> {
    return await this.post({ route: FAWRY_ROUTES.REFUND, payload });
  }

  async createCardTokenV1(
    payload: Requests.CreateCardTokenPayload
  ): Promise<Responses.CreateCardTokenResponse> {
    return await this.post({
      route: FAWRY_ROUTES.CREATE_CARD_TOKEN_V1,
      payload,
    });
  }

  /**
   * this can be a mistake in the docs: https://developer.fawrystaging.com/docs/card-tokens/create-use-token
   */
  async createCardTokenV2(
    payload: Requests.CreateCardTokenPayload
  ): Promise<Responses.CreateCardTokenResponse> {
    return await this.post({
      route: FAWRY_ROUTES.CREATE_CARD_TOKEN_V2,
      payload,
    });
  }

  async listCardTokens(
    customerProfileId: number
  ): Promise<Responses.ListCardTokensResponse> {
    const payload: Requests.ListCardTokensPayload = {
      customerProfileId,
      merchantCode: fawryConfig.merchantCode,
      signature: genSignature.forListCardTokensRequest(customerProfileId),
    };

    return await this.get({
      route: FAWRY_ROUTES.LIST_CARD_TOKENS,
      params: payload,
    });
  }

  async deleteCardToken({
    customerProfileId,
    cardToken,
  }: {
    customerProfileId: number;
    cardToken: string;
  }): Promise<Responses.DeleteCardTokenResponse> {
    const payload: Requests.DeleteCardTokenPayload = {
      merchantCode: fawryConfig.merchantCode,
      customerProfileId,
      cardToken,
      signature: genSignature.forDeleteCardTokenRequest({
        customerProfileId,
        cardToken,
      }),
    };

    /**
     * It is important to note that the delete card payload/body should be sent
     * as url params and not json body. Event that fawry docs/examples stated
     * that it should be sent as json body but it doesn't work.
     *
     * TODO: communicate this to fawry dev support.
     */
    return await this.del({
      route: FAWRY_ROUTES.DELETE_CARD_TOKEN,
      params: payload,
    });
  }
}

export const fawry = new Api(createClient(environment));
