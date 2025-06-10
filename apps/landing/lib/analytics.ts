import { formatFbc } from "@litespace/utils/analytics";
import { api } from "@/lib/api";
import { IAnalytics } from "@litespace/types";

export function sendFacebookEvent({
  page,
  eventName,
  fbclid,
}: {
  page: string;
  fbclid?: string | null;
  eventName: IAnalytics.EventName;
}) {
  return api.analytics.trackFacebookEvents({
    eventName: eventName,
    eventSourceUrl: window.location.href,
    fbc: formatFbc(fbclid),
    customData: {
      page: page,
    },
  });
}
