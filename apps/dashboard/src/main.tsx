import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { Spinner } from "@litespace/ui/Spinner";
import { locales } from "@litespace/ui/locales";
import { backend } from "@litespace/ui/backend";
import { IntlProvider } from "react-intl";
import { store, persistor } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackendProvider } from "@litespace/headless/backend";
import { AtlasProvider } from "@litespace/headless/atlas";
import { SocketProvider } from "@litespace/headless/socket";
import { AppConfigProvider } from "@litespace/headless/config";
import { PersistGate } from "redux-persist/integration/react";
import { ToastProvider } from "@litespace/ui/Toast";
import { UserProvider } from "@litespace/headless/context/user";
import { MediaQueryProvider } from "@litespace/headless/mediaQuery";
import App from "@/App.tsx";

import "@litespace/ui/style.css";
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
        </ToastProvider>
      </AppConfigProvider>
    </IntlProvider>
  </StrictMode>
);
