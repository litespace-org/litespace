import { LocalId } from "@/locales/request";
import { Landing } from "@litespace/utils/routes";

export const PAGES: Array<{ title: LocalId; route: string }> = [
  {
    title: "navbar/main",
    route: Landing.Home,
  },
  {
    title: "navbar/subscriptions",
    route: Landing.Subscriptions,
  },
  {
    title: "navbar/be-a-tutor",
    route: Landing.BecomeTutor,
  },
];

export const SMALL_SCREEN_SIDEBAR_WIDTH_PX = 166;
export const SMALL_SCREEN_NAVBAR_HEIGHT_PX = 72;
