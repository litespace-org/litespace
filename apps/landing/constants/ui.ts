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

// Main page hero section
export const HERO_SECTION_HEIGHT_PERCENT = 0.8; // 80vh
export const MOBILE_HERO_SECTION_HEIGHT = 484;
export const TABLET_HERO_SECTION_HEIGHT = 592;
export const LARGE_SCREEN_HERO_SECTION_HEIGHT = 866;

// Media query breakpoints
export const SM = 640;
export const MD = 768;
export const LG = 1024;
