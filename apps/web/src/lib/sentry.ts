import { useEffect } from "react";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import { env } from "@/lib/env";

Sentry.init({
  dsn: env.sentryDsn,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  enabled: env.client !== "local",
});

export const capture = Sentry.captureException;
