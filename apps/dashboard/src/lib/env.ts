import { Env } from "@litespace/types";
import zod from "zod";

const envs = ["local", "staging", "production"] as const satisfies
  | Env.Server[]
  | Env.Client[];

const schema = zod.object({
  server: zod.enum(envs, {
    message:
      "Missing or invalid server. Expecting `VITE_SERVER` environment variable. It can be `local` or `staging` or `production`",
  }),
  client: zod.enum(envs, {
    message:
      "Missing or invalid server. Expecting `VITE_CLIENT` environment variable. It can be `local` or `staging` or `production`",
  }),
});

export const env = schema.parse({
  server: import.meta.env.VITE_SERVER,
  client: import.meta.env.VITE_CLIENT,
});

export const production = env.client === "production";
export const staging = env.client === "staging";
export const local = env.client === "local";
