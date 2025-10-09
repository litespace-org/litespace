import ga from "react-ga4";
import { env } from "@/lib/env";

// [GA4] Recommended events
// https://developers.google.com/tag-platform/gtagjs/reference/events
// For Debugging Download:
// https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna?hl=en

export type Category = "home" | "navbar";

export type Action =
  | "open_faq_question"
  | "click_social_link"
  | "click_register"
  | "click_login"
  | "click_hero_section_cta"
  | "view_pricing"
  | "select_tutor";

export type Params = {
  category: Category;
  action: Action;
  label?: string;
  value?: number;
};

ga.initialize(env.gaMeasurementId);

export function track(
  action: Action,
  category: Category,
  label?: string,
  value?: number
) {
  ga.gtag("event", action, {
    category,
    label,
    value,
  });
}
