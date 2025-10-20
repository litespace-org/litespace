import mixpanel from "mixpanel-browser";
import { env } from "@/lib/env";

mixpanel.init(env.mixpanelToken, {
  autocapture: true,
  record_sessions_percent: 100,
  persistence: "localStorage",
});

export { mixpanel };
