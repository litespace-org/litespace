import { Route } from "@/constants/routes";
import { LocalId } from "@/locales/request";

export const PAGES: Array<{ title: LocalId; route: string }> = [
  {
    title: "navbar/main",
    route: Route.Home,
  },
  {
    title: "navbar/subscriptions",
    route: Route.Subscriptions,
  },
  {
    title: "navbar/be-a-tutor",
    route: Route.BecomeTutor,
  },
];

export const SOCIAL_MEDIA: Array<{ name: string; src: string; href: string }> =
  [
    {
      name: "Instagram",
      src: "/instagram.svg",
      href: "https://www.instagram.com/litespace",
    },
    {
      name: "Facebook",
      src: "/facebook.svg",
      href: "https://www.facebook.com/litespace",
    },
    {
      name: "LinkedIn",
      src: "/linkedin.svg",
      href: "https://www.linkedin.com/litespace",
    },
  ];

export const SMALL_SCREEN_SIDEBAR_WIDTH_PX = 166;
export const SMALL_SCREEN_NAVBAR_HEIGHT_PX = 72;
