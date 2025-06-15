import { Responses } from "@/fawry/types";
import dayjs from "@/lib/dayjs";

type MockResponse = {
  /**
   * Specific type of the response.
   * Example: "PaymentStatusResponse", "ChargeResponse", etc.
   */
  type: "MockAPI";
  /**
   * The response status code.
   */
  statusCode: number;
  /**
   * Exact description of the status of FawryPay response.
   */
  statusDescription: string;
};

class MockFawryApi {
  async payWithCard(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock payWithCard handler",
    };
  }

  async payWithRefNum(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock payWithRefNum handler",
    };
  }

  async payWithEWallet(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock payWithEWallet handler",
    };
  }

  async payWithBankInstallments(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock payWithBankInstallments handler",
    };
  }

  async authorizePayment(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock authorizePayment handler",
    };
  }

  async capturePayment(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock capturePayment handler",
    };
  }

  async cancelAuthPayment(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock cancelAuthPayment handler",
    };
  }

  async getPaymentStatus(): Promise<
    MockResponse &
      Pick<
        Responses.GetPaymentStatus,
        "orderStatus" | "fawryRefNumber" | "paymentTime"
      >
  > {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock cancelAuthPayment handler",
      orderStatus: "PAID",
      fawryRefNumber: "123",
      paymentTime: dayjs().toDate(),
    };
  }

  async cancelUnpaidOrder(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock cancelUnpaidOrder handler",
    };
  }

  async refund(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock refund handler",
    };
  }

  async createCardTokenV1(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock createCardTokenV1 handler",
    };
  }

  async createCardTokenV2(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock createCardTokenV2 handler",
    };
  }

  async findCardTokens(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock findCardTokens handler",
    };
  }

  async deleteCardToken(): Promise<MockResponse> {
    return {
      type: "MockAPI",
      statusCode: 200,
      statusDescription: "mock deleteCardToken handler",
    };
  }
}

jest.mock("@/fawry/api", () => ({
  fawry: new MockFawryApi(),
}));
