import { Env } from "@litespace/types";

export const clients: Record<Env.Client, Record<Env.App, string>> = {
  local: {
    web: "http://localhost:3000",
    landing: "http://localhost:3004",
    dashboard: "http://localhost:3001",
  },
  staging: {
    web: "https://app.staging.litespace.org",
    landing: "https://landing.staging.litespace.org",
    dashboard: "https://dashboard.staging.litespace.org",
  },
  production: {
    web: "https://app.litespace.org",
    landing: "https://litespace.org",
    dashboard: "https://dashboard.litespace.org",
  },
};
