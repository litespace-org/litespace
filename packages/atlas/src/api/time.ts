import { Base } from "@/lib/base";

export class Time extends Base {
  async currentZoneTime(
    timezone: string
  ): Promise<{ iso: string; hour: number; minute: number; second: number }> {
    return this.get({ route: `/api/v1/time/current`, params: { timezone } });
  }
}
