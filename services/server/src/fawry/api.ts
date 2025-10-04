import { fawryConfig } from "@/constants";
import { Base } from "@litespace/atlas";
import { Requests, Responses } from "@/fawry/types";
import { FAWRY_API_URL_CURRENT, FAWRY_ROUTES } from "@/fawry/constants";
import { genSignature } from "@/fawry/lib";
import { forgeFawryPayload } from "@/fawry/lib/utils";
import axios, { AxiosInstance } from "axios";
import https from "node:https";

export function createClient(): AxiosInstance {
  return axios.create({
    baseURL: FAWRY_API_URL_CURRENT,
    headers: { "Content-Type": "application/json" },
    httpsAgent: new https.Agent({ keepAlive: false }),
  });
}

class Api extends Base {
  async payWithCard({
    merchantRefNum,
    cardToken,
    customer,
    amount,
    cvv,
  }: {
    customer: Requests.Customer;
    merchantRefNum: number;
    cardToken: string;
    amount: number;
    cvv: string;
  }): Promise<Responses.PayWithCard> {
    const signature = genSignature.forPayWithCard({
      amount,
      cardToken,
      customerProfileId: customer.id,
      merchantRefNum,
      returnUrl: "https://app.staging.litespace.org",
      cvv,
    });

    const base = forgeFawryPayload({
      merchantRefNum,
      paymentMethod: "CARD",
      amount,
      signature,
      customer,
      chargeItems: [
        {
          itemId: "1",
          description: "LiteSpace subscription",
          price: amount,
          quantity: 1,
        },
      ],
      description: "LiteSpace subscription",
    });

    const payload: Requests.PayWithCardPayload = {
      ...base,
      paymentMethod: "CARD",
      cardToken,
      cvv,
      enable3DS: true,
      authCaptureModePayment: false,
      returnUrl: "https://app.staging.litespace.org",
    };

    return await this.post({ route: FAWRY_ROUTES.PAY_WITH_CARD, payload });
  }

  async payWithRefNum({
    merchantRefNum,
    amount,
    customer,
  }: {
    merchantRefNum: number;
    amount: number;
    customer: Requests.Customer;
  }): Promise<Responses.PayWithRefNum> {
    const base = forgeFawryPayload({
      paymentMethod: "PAYATFAWRY",
      merchantRefNum,
      amount,
      signature: genSignature.forPayWithRefNum({
        merchantRefNum,
        customerProfileId: customer.id,
        amount,
      }),
      customer,
      chargeItems: [
        {
          itemId: merchantRefNum.toString(),
          description: "LiteSpace subscription",
          price: amount,
          quantity: 1,
        },
      ],
      description: "Pay LiteSpace subscription",
    });

    const payload: Requests.PayWithRefNumPayload = {
      ...base,
      paymentMethod: "PAYATFAWRY",
    };

    return await this.post({ route: FAWRY_ROUTES.PAY_WITH_REFNUM, payload });
  }

  async payWithEWallet({
    merchantRefNum,
    amount,
    customer,
  }: {
    merchantRefNum: number;
    amount: number;
    customer: Requests.Customer;
  }): Promise<Responses.PayWithEWallet> {
    const forgedPayload = forgeFawryPayload({
      merchantRefNum,
      paymentMethod: "MWALLET",
      amount,
      signature: genSignature.forPayWithEWallet({
        merchantRefNum: merchantRefNum,
        customerProfileId: customer.id,
        amount,
      }),
      customer,
      chargeItems: [
        {
          itemId: merchantRefNum.toString(),
          description: "LiteSpace subscription",
          price: amount,
          quantity: 1,
        },
      ],
      description: "Pay LiteSpace subscription",
    });

    const payload: Requests.PayWithEWalletPayload = {
      ...forgedPayload,
      paymentMethod: "MWALLET",
    };

    return await this.post({ route: FAWRY_ROUTES.PAY_WITH_EWALLET, payload });
  }

  async payWithBankInstallments(
    payload: Requests.PayWithCardAndBankInstallmentsPayload
  ): Promise<Responses.PayWithCardAndBankInstallments> {
    return await this.post({
      route: FAWRY_ROUTES.PAY_WITH_BANK_INSTALLMENTS,
      payload,
    });
  }

  async authorizePayment(
    payload: Requests.AuthorizePaymentPayload
  ): Promise<Responses.AuthorizePayment> {
    return await this.post({ route: FAWRY_ROUTES.AUTHORIZE_PAYMENT, payload });
  }

  async capturePayment(
    payload: Requests.CapturePaymentPayload
  ): Promise<Responses.CapturePaymentResponse> {
    return await this.post({ route: FAWRY_ROUTES.CAPTURE_PAYMENT, payload });
  }

  async cancelAuthPayment(
    payload: Requests.CancelPaymentAuthPayload
  ): Promise<Responses.CancelPaymentAuth> {
    return await this.post({
      route: FAWRY_ROUTES.CANCEL_AUTHORIZED_PAYMENT,
      payload,
    });
  }

  async getPaymentStatus(
    merchantRefNumber: number
  ): Promise<Responses.GetPaymentStatus> {
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

  async findCardTokens(
    customerProfileId: number
  ): Promise<Responses.ListCardTokens> {
    const payload: Requests.ListCardTokensPayload = {
      customerProfileId,
      merchantCode: fawryConfig.merchantCode,
      signature: genSignature.forFindCardTokensRequest(customerProfileId),
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

export const fawry = new Api(createClient());
