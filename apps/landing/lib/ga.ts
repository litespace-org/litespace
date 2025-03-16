import ga from "react-ga4";
import { env } from "@/lib/env";

// [GA4] Recommended events
// https://developers.google.com/tag-platform/gtagjs/reference/events
// https://support.google.com/analytics/answer/9267735?hl=en

export type Event =
  | "navigation"
  | "register"
  | "login"
  | "toggle_nav_menu"
  | "view_promotion" // https://developers.google.com/tag-platform/gtagjs/reference/events#view_promotion
  | "view_item_list" // https://developers.google.com/tag-platform/gtagjs/reference/events#view_item_list
  | "view_item" // https://developers.google.com/tag-platform/gtagjs/reference/events#view_item
  | "book_lesson"
  | "view_pricing_list"
  | "view_pricing_tab"
  | "view_pricing_item"
  | "view_faq_list"
  | "view_faq_item"
  | "view_social_media"
  | "join_group"; // https://developers.google.com/tag-platform/gtagjs/reference/events#join_group

export type Action = "button" | "link" | "scroll";

export type Params = {
  action?: Action;
  label?: string;
  src?: string;
  [key: string]: string | number | undefined;
};

ga.initialize(env.gaMeasurementId);

export function track(event: Event, params?: Params) {
  ga.event(event, params);
}
