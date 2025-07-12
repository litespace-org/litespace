import "@/lib/sentry";
import { createRoot } from "react-dom/client";
import { locales } from "@litespace/ui/locales";
import { IntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/constants/auth";
import { ServerProvider } from "@litespace/headless/server";
import { ApiProvider } from "@litespace/headless/api";
import { SocketProvider } from "@litespace/headless/socket";
import { UserProvider } from "@litespace/headless/context/user";
import { ToastProvider } from "@litespace/ui/Toast";
import { Direction } from "@litespace/ui/Direction";
import { AppConfigProvider } from "@litespace/headless/config";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { LocalStorage } from "@litespace/headless/storage";
import { LoggerProvider } from "@litespace/headless/logger";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import App from "@/App";

import "@/lib/ga";
import "@/lib/clarity";
import "@/lib/window";
import "@litespace/ui/tailwind.css";
import { SubscriptionProvider } from "@litespace/headless/context/subscription";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <IntlProvider
    messages={locales["ar-EG"]}
    locale="ar-EG"
    defaultLocale="ar-EG"
  >
    <Direction>
      <LoggerProvider logger={logger}>
        <AppConfigProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
              <ServerProvider server={env.server} storage={new LocalStorage()}>
                <ApiProvider>
                  <SocketProvider>
                    <UserProvider>
                      <SubscriptionProvider>
                        <MediaQueryProvider>
                          <ToastProvider>
                            <App />
                          </ToastProvider>
                        </MediaQueryProvider>
                      </SubscriptionProvider>
                    </UserProvider>
                  </SocketProvider>
                </ApiProvider>
              </ServerProvider>
            </QueryClientProvider>
          </GoogleOAuthProvider>
        </AppConfigProvider>
      </LoggerProvider>
    </Direction>
  </IntlProvider>
);
