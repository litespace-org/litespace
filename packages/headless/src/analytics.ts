import ReactGA from "react-ga4";
import { useCallback } from "react";

export type GoogleAnalyticsEventCategory =
  | "register"
  | "engagement"
  | "landing"
  | "booking"
  | "purchase";

export enum GoogleAnalyticsEventName {
  FAQ = "faq",
  landing = "landing",
  PageView = "page-view",
  Register = "register",
  Login = "login",
  StartChat = "start-chat",
  BookLesson = "book-lesson",
  RebookLesson = "rebook-lesson",
  CancelLesson = "cancel-lesson",
  VideoPlay = "video-play",
  JoinLesson = "join-lesson",
  LeaveLesson = "leave-lesson",
  RateLesson = "rate-lesson",
  StartSubscription = "start-subscription",
  CompleteSubscription = "complete-subscription",
  RateTutor = "rate-tutor",
}

type CustomGoogleAnalyticEvent = {
  category: GoogleAnalyticsEventCategory;
  name: GoogleAnalyticsEventName;
  label?: string;
  params?: { [key: string]: string | number | undefined };
};

export function useSendCustomEvent(userId?: string) {
  const sendEvent = useCallback(
    (event: CustomGoogleAnalyticEvent) => {
      ReactGA.event(event.name, {
        category: event.category,
        label: event.label,
        uuid: userId || "un-authenticated",
        ...event.params,
      });
    },
    [userId]
  );
  return sendEvent;
}
