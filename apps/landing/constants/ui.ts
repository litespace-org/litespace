import { Route } from "@/constants/routes";
import { LocalId } from "@litespace/ui/locales";

export const PAGES: Array<{ title: LocalId; route: string }> = [
  {
    title: "navbar.main",
    route: Route.Home,
  },
  {
    title: "navbar.subscriptions",
    route: Route.Subscriptions,
  },
  {
    title: "navbar.be-a-tutor",
    route: Route.BecomeTutor,
  },
];

export const SMALL_SCREEN_SIDEBAR_WIDTH_PX = 166;
export const SMALL_SCREEN_NAVBAR_HEIGHT_PX = 72;
