import { env } from "@/lib/env";
import { Dashboard, RoutesManager } from "@litespace/utils/routes";

export const router = new RoutesManager(env.client);

export const CALLBACK_URL = window.location.origin.concat(
  Dashboard.VerifyEmail
);
