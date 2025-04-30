import { Base } from "@/lib/base";
import { ITransaction } from "@litespace/types";

export class Transaction extends Base {
  async findById(id: number): Promise<ITransaction.Self> {
    return this.get({ route: `/api/v1/tx/${id}` });
  }

  async find(
    payload?: ITransaction.FindQueryApi
  ): Promise<ITransaction.FindApiResponse> {
    return this.get({ route: `/api/v1/tx/list`, payload: payload });
  }

  async findPending(): Promise<ITransaction.Self> {
    return this.get({ route: `/api/v1/tx/pending` });
  }
}
