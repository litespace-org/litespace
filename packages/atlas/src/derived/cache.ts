import { Base } from "@/base";

export class Cache extends Base {
  public async flush(): Promise<void> {
    return await this.del(`/api/v1/cache/flush`);
  }
}
