import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { locales } from "@litespace/ui/locales";
import { IntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerProvider } from "@litespace/headless/server";
import { ApiProvider } from "@litespace/headless/api";
import { SocketProvider } from "@litespace/headless/socket";
import { AppConfigProvider } from "@litespace/headless/config";
import { ToastProvider } from "@litespace/ui/Toast";
import { UserProvider } from "@litespace/headless/context/user";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { LocalStorage } from "@litespace/headless/storage";
import { Direction } from "@litespace/ui/Direction";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { LoggerProvider } from "@litespace/headless/logger";
import App from "@/App.tsx";

import "@litespace/ui/tailwind.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const storage = new LocalStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <Direction dir="rtl">
        <LoggerProvider logger={logger}>
          <AppConfigProvider>
            <ToastProvider>
              <QueryClientProvider client={queryClient}>
                <ServerProvider server={env.server} storage={storage}>
                  <ApiProvider>
                    <SocketProvider>
                      <UserProvider>
                        <MediaQueryProvider>
                          <App />
                        </MediaQueryProvider>
                      </UserProvider>
                    </SocketProvider>
                  </ApiProvider>
                </ServerProvider>
              </QueryClientProvider>
            </ToastProvider>
          </AppConfigProvider>
        </LoggerProvider>
      </Direction>
    </IntlProvider>
  </StrictMode>
);
