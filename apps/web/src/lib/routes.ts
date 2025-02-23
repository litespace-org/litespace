import { Web, RoutesManager } from "@litespace/utils/routes";
import { env } from "@/lib/env";

export const router = new RoutesManager(env.client);

export const TUTOR_PROFILE_REGEX = /\/t\/\d+\/?/;

export const VERIFY_EMAIL_CALLBACK_URL = window.location.origin.concat(
  Web.VerifyEmail
);
