import { formatFbc } from "@/lib/analytics";
import { env } from "@/lib/env";
import { Atlas } from "@litespace/atlas";
import { IAnalytics } from "@litespace/types";

const atlas = new Atlas(env.server, null);

export function sendFacebookEvent({
  page,
  eventName,
  fbclid,
}: {
  page: string;
  fbclid?: string;
  eventName: IAnalytics.EventType;
}) {
  return atlas.analytics.trackFacebookEvents({
    eventName: eventName,
    eventSourceUrl: window.location.href,
    fbc: formatFbc(fbclid || null),
    customData: {
      page: page,
    },
  });
}
