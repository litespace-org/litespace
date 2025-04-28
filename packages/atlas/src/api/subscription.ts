import { Base } from "@/lib/base";
import { ISubscription } from "@litespace/types";

export class Subscription extends Base {
  async findById(id: number): Promise<ISubscription.Self> {
    return this.get({ route: `/api/v1/sub/${id}` });
  }

  async find(
    params?: ISubscription.FindQueryApi
  ): Promise<ISubscription.FindApiResponse> {
    return this.get({ route: `/api/v1/sub/list`, params });
  }

  async findCurrentSubscription(): Promise<ISubscription.FindCurrentApiResponse> {
    return this.get({ route: `/api/v1/sub/current` });
  }
}
