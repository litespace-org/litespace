export type PayWithCardResponse = {
  /**
   * Specific type of the response.
   * Example: "PaymentStatusResponse", "ChargeResponse", etc.
   */
  type: string,
  nextAction: {
    /**
     * Redirect URL for you to redirect your client for payment authentication.
     */
    redirectUrl: string,
    /**
     * The type of response.
     * Example: "THREE_D_SECURE"
     */
    type: string,
  }
  /**
   * The response status code.
   */
  statusCode: number,
  /**
   * Exact description of the status of FawryPay response.
   */
  statusDescription: string,
}

export type PayWithEWalletResponse = {}


export type PayWithRefNumResponse = {}


export type GetInstallmentPlansResponse = {}


export type PayWithCardAndBankInstallmentsResponse = {}


export type RefundResponse = {}


export type CreateCardTokenResponse = {}


export type ListCardTokensResponse = {}


export type DeleteCardTokenResponse = {}


export type CancelUnpaidOrderResponse = {}


export type AuthorizePaymentResponse = {}


export type CapturePaymentResponse = {}


export type CancelPaymentAuthorization = {}
