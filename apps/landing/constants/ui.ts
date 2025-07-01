import { LocalId } from "@/locales/request";
import { Landing } from "@litespace/utils/routes";

export const PAGES: Array<{ title: LocalId; route: string }> = [
  {
    title: "navbar/main",
    route: Landing.Home,
  },
  {
    title: "navbar/pricing",
    route: Landing.Pricing,
  },
  /*
   * @TODO: implement be-a-tutor page
  {
    title: "navbar/be-a-tutor",
    route: Landing.Tutor,
  },
  */
];

export const SMALL_SCREEN_SIDEBAR_WIDTH_PX = 166;
export const SMALL_SCREEN_NAVBAR_HEIGHT_PX = 72;
