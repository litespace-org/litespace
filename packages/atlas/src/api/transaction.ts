import { Base } from "@/lib/base";
import { ITransaction } from "@litespace/types";

export class Transaction extends Base {
  async findById(id: number): Promise<ITransaction.FindByIdApiResponse> {
    return this.get({ route: `/api/v1/tx/${id}` });
  }

  async findRefundableAmount(
    id: number
  ): Promise<ITransaction.FindRefundableAmountApiResponse> {
    return this.get({ route: `/api/v1/tx/refund/${id}` });
  }

  async find(
    payload?: ITransaction.FindApiQuery
  ): Promise<ITransaction.FindApiResponse> {
    return this.get({ route: `/api/v1/tx/list`, payload: payload });
  }

  async findLast(): Promise<ITransaction.FindLastApiResponse> {
    return this.get({ route: `/api/v1/tx/last` });
  }
}
