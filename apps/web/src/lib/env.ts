import { Env } from "@litespace/types";
import zod from "zod";

const envs = ["local", "staging", "production"] as const satisfies
  | Env.Server[]
  | Env.Client[];

const schema = zod.object({
  googleClientId: zod.string().endsWith(".apps.googleusercontent.com"),
  server: zod.enum(envs, {
    message:
      "Missing or invalid server. Expecting `VITE_SERVER` environment variable. It can be `local` or `staging` or `production`",
  }),
  client: zod.enum(envs, {
    message:
      "Missing or invalid server. Expecting `VITE_CLIENT` environment variable. It can be `local` or `staging` or `production`",
  }),
  sentryDsn: zod.string().url(),
  gaMeasurementId: zod.string().startsWith("G-").length(12),
});

export const env = schema.parse({
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  server: import.meta.env.VITE_SERVER,
  client: import.meta.env.VITE_CLIENT,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  gaMeasurementId: import.meta.env.GA_MEASUREMENT_ID,
});
