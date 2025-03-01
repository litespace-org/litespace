import "@/lib/sentry";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { locales } from "@litespace/ui/locales";
import { Spinner } from "@litespace/ui/Spinner";
import { IntlProvider } from "react-intl";
import { store, persistor } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/constants/auth";
import { ServerProvider } from "@litespace/headless/server";
import { AtlasProvider } from "@litespace/headless/atlas";
import { SocketProvider } from "@litespace/headless/socket";
import { UserProvider } from "@litespace/headless/context/user";
import { ToastProvider } from "@litespace/ui/Toast";
import { Direction } from "@litespace/ui/Direction";
import { AppConfigProvider } from "@litespace/headless/config";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import { LocalStorage } from "@litespace/headless/storage";
import { env } from "@/lib/env";
import App from "@/App";

import "@litespace/ui/tailwind.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <IntlProvider
    messages={locales["ar-EG"]}
    locale="ar-EG"
    defaultLocale="ar-EG"
  >
    <Direction>
      <AppConfigProvider>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <QueryClientProvider client={queryClient}>
            <ServerProvider server={env.server} storage={new LocalStorage()}>
              <AtlasProvider>
                <SocketProvider>
                  <UserProvider>
                    <MediaQueryProvider>
                      <ToastProvider>
                        <ReduxProvider store={store}>
                          <PersistGate
                            loading={
                              <div className="flex items-center justify-center w-screen h-screen">
                                <Spinner />
                              </div>
                            }
                            persistor={persistor}
                          >
                            <App />
                          </PersistGate>
                        </ReduxProvider>
                      </ToastProvider>
                    </MediaQueryProvider>
                  </UserProvider>
                </SocketProvider>
              </AtlasProvider>
            </ServerProvider>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </AppConfigProvider>
    </Direction>
  </IntlProvider>
);
