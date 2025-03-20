import { formatFbc } from "@litespace/utils/facebook";
import { atlas } from "@/lib/atlas";
import { IAnalytics } from "@litespace/types";

export function sendFacebookEvent({
  page,
  eventName,
  fbclid,
}: {
  page: string;
  fbclid?: string | null;
  eventName: IAnalytics.EventType;
}) {
  return atlas.analytics.trackFacebookEvents({
    eventName: eventName,
    eventSourceUrl: window.location.href,
    fbc: formatFbc(fbclid),
    customData: {
      page: page,
    },
  });
}
