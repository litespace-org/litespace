import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { locales } from "@litespace/ui/locales";
import { IntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerProvider } from "@litespace/headless/server";
import { AtlasProvider } from "@litespace/headless/atlas";
import { SocketProvider } from "@litespace/headless/socket";
import { AppConfigProvider } from "@litespace/headless/config";
import { ToastProvider } from "@litespace/ui/Toast";
import { UserProvider } from "@litespace/headless/context/user";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { LocalStorage } from "@litespace/headless/storage";
import { env } from "@/lib/env";
import App from "@/App.tsx";

import "@litespace/ui/tailwind.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <AppConfigProvider>
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <ServerProvider server={env.server} storage={new LocalStorage()}>
              <AtlasProvider>
                <SocketProvider>
                  <UserProvider>
                    <MediaQueryProvider>
                      <App />
                    </MediaQueryProvider>
                  </UserProvider>
                </SocketProvider>
              </AtlasProvider>
            </ServerProvider>
          </QueryClientProvider>
        </ToastProvider>
      </AppConfigProvider>
    </IntlProvider>
  </StrictMode>
);
