import ga from "react-ga4";
import { env } from "@/lib/env";

// [GA4] Recommended events
// https://developers.google.com/tag-platform/gtagjs/reference/events
// For Debugging Download:
// https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna?hl=en

ga.initialize(env.gaMeasurementId);

export { ga };
