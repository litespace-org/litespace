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
});

export const env = schema.parse({
  server: process.env.SERVER,
  client: process.env.CLIENT,
});
