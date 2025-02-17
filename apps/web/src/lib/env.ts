import { Backend } from "@litespace/types";
import zod from "zod";

const schema = zod.object({
  googleClientId: zod.string().endsWith(".apps.googleusercontent.com"),
  backend: zod.enum([Backend.Local, Backend.Staging, Backend.Production]),
  sentryDsn: zod.string().url(),
});

export const env = schema.parse({
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  backend: import.meta.env.VITE_BACKEND,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
});
