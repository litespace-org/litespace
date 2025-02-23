import { Dashboard, RoutesManager } from "@litespace/utils/routes";
import { env } from "@/lib/env";

export const router = new RoutesManager(env.client);

export const CALLBACK_URL = window.location.origin.concat(
  Dashboard.VerifyEmail
);
