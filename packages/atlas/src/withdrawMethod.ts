import { Base } from "@/base";
import { IWithdrawMethod } from "@litespace/types";

export class WithdrawMethod extends Base {
  async create(
    payload: IWithdrawMethod.CreatePayload
  ): Promise<IWithdrawMethod.Self> {
    return this.post({ route: "/api/v1/withdraw-method", payload });
  }

  async update(
    type: IWithdrawMethod.Type,
    payload: IWithdrawMethod.UpdatePayload
  ): Promise<void> {
    return this.put({ route: `/api/v1/withdraw-method/${type}`, payload });
  }

  async find(): Promise<IWithdrawMethod.Self[]> {
    return this.get({ route: `/api/v1/withdraw-method/list` });
  }
}
