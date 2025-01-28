import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { locales } from "@litespace/luna/locales";
import { backend } from "@litespace/luna/backend";
import { Spinner } from "@litespace/luna/Spinner";
import { IntlProvider } from "react-intl";
import { store, persistor } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/constants/auth";
import { BackendProvider } from "@litespace/headless/backend";
import { AtlasProvider } from "@litespace/headless/atlas";
import { SocketProvider } from "@litespace/headless/socket";
import { UserProvider } from "@litespace/headless/context/user";
import { ToastProvider } from "@litespace/luna/Toast";
import { Direction } from "@litespace/luna/Direction";
import { AppConfigProvider } from "@litespace/headless/config";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import App from "@/App";

import "@litespace/luna/style.css";
import "@litespace/luna/tailwind.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <IntlProvider
    messages={locales["ar-EG"]}
    locale="ar-EG"
    defaultLocale="ar-EG"
  >
    <Direction>
      <ToastProvider>
        <AppConfigProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
              <BackendProvider backend={backend}>
                <AtlasProvider>
                  <SocketProvider>
                    <UserProvider>
                      <MediaQueryProvider>
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
                      </MediaQueryProvider>
                    </UserProvider>
                  </SocketProvider>
                </AtlasProvider>
              </BackendProvider>
            </QueryClientProvider>
          </GoogleOAuthProvider>
        </AppConfigProvider>
      </ToastProvider>
    </Direction>
  </IntlProvider>
);
