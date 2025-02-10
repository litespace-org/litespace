"use client";

import { Route } from "@/types/routes";
import { LocalId } from "@litespace/ui/locales";

export const pages: Array<{ title: LocalId; route: string }> = [
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
    route: Route.BeTutor,
  },
];
