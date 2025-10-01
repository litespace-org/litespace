import { Base } from "@/lib/base";

export class Time extends Base {
  async currentHour(timezone: string): Promise<{ hour: number }> {
    return this.get({ route: `/api/v1/time/hour`, params: { timezone } });
  }
}
