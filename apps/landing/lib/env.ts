import { Env } from "@litespace/types";
import zod from "zod";

const envs = ["local", "staging", "production"] as const satisfies
  | Env.Server[]
  | Env.Client[];

const schema = zod.object({
  server: zod.enum(envs, {
    message:
      "Missing or invalid server. Expecting `SERVER` environment variable. It can be `local` or `staging` or `production`",
  }),
  client: zod.enum(envs, {
    message:
      "Missing or invalid server. Expecting `CLIENT` environment variable. It can be `local` or `staging` or `production`",
  }),
  gaMeasurementId: zod.string().startsWith("G-").length(12),
  clarityProjectId: zod.string().length(10),
  mixpanelToken: zod.string(),
});

export const env = schema.parse({
  server: process.env.SERVER,
  client: process.env.CLIENT,
  gaMeasurementId: process.env.GA_MEASUREMENT_ID,
  clarityProjectId: process.env.CLARITY_PROJECT_ID,
  mixpanelToken: process.env.MIXPANEL_TOKEN,
});
