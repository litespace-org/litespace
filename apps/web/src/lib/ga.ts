import ga from "react-ga4";
import { env } from "@/lib/env";

// [GA4] Recommended events
// https://developers.google.com/tag-platform/gtagjs/reference/events
// For Debugging Download:
// https://chromewebstore.google.com/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna?hl=en

export type Category =
  | "student_dashboard"
  | "tutor_profile"
  | "navbar"
  | "sidebar"
  | "plans"
  | "checkout"
  | "lessons"
  | "tutors";

export type Action =
  | "book_lesson"
  | "click_tutor_card"
  | "view_tutor_ratings"
  | "click_subscribe"
  | "logout"
  | "select_plan"
  | "select_payment_method"
  | "change_plan"
  | "leave_checkout"
  | "add_card"
  | "add_card_ok"
  | "add_card_err"
  | "remove_card"
  | "remove_card_ok"
  | "remove_card_err"
  | "cancel_payment"
  | "cancel_payment_ok"
  | "cancel_payment_err"
  | "select_card"
  | "enter_cvv"
  | "enter_phone"
  | "pay_with_card"
  | "pay_with_card_err"
  | "pay_with_ewallet"
  | "pay_with_ewallet_err"
  | "pay_with_fawry"
  | "pay_with_fawry_err"
  | "join_lesson"
  | "cancel_lesson"
  | "reschedule_lesson"
  | "rebook_lesson"
  | "send_message"
  | "play_tutor_video"
  | "complete_student_tour"
  | "skip_student_tour";

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
