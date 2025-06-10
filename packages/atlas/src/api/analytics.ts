import { Base } from "@/lib/base";
import { IAnalytics } from "@litespace/types";

export class Analytics extends Base {
  async trackFacebookEvents(
    payload: IAnalytics.ConversionEventPayload
  ): Promise<void> {
    return this.post({
      route: "/api/v1/analytics/fb/track",
      payload,
    });
  }
}
