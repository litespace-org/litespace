import ReactGA from "react-ga4";
import { useUserContext } from "@/user/context";
import { useCallback } from "react";

export type GoogleAnalyticsEventCategory =
  | "register"
  | "engagement"
  | "booking"
  | "purchase";

export enum GoogleAnalyticsEventName {
  FAQ = "faq",
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

export function useSendCustomEvent() {
  const { user } = useUserContext();

  const sendEvent = useCallback(
    (event: CustomGoogleAnalyticEvent) => {
      ReactGA.event(event.name, {
        category: event.category,
        label: event.label,
        uuid: user?.id || "un-authenticated",
        ...event.params,
      });
    },
    [user]
  );
  return sendEvent;
}
