import { Base } from "@/lib/base";

export class Time extends Base {
  async currentZoneTime(
    timezone: string
  ): Promise<{ iso: string; hour: number; minute: number; second: number }> {
    return this.client
      .get("/api/v1/time/current", {
        params: { timezone },
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      .then((response) => response.data);
  }
}
