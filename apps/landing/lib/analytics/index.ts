import { ga } from "@/lib/analytics/ga";
import { mixpanel } from "@/lib/analytics/mixpanel";

// [GA4] Recommended events
// https://developers.google.com/tag-platform/gtagjs/reference/events
// For Debugging Download:
// https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna?hl=en

export type Category = "home" | "navbar" | "other";

export type Action =
  | "open_faq_question"
  | "click_navbar_link"
  | "click_social_link"
  | "click_register"
  | "click_login"
  | "click_hero_section_cta"
  | "view_pricing"
  | "select_tutor"
  | "go_to_home"
  | "view_faq_item"
  | "view_social_media";

export type Params = {
  category: Category;
  action: Action;
  label?: string;
  value?: number;
};

export function track({
  action,
  category,
  label,
  value,
}: {
  action: Action;
  category: Category;
  label?: string;
  value?: number;
}) {
  ga.gtag("event", action, {
    category,
    label,
    value,
  });

  mixpanel.track(action, {
    category,
    label,
    value,
  });
}
