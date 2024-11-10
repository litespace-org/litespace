import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { Spinner } from "@litespace/luna/Spinner";
import { locales } from "@litespace/luna/locales";
import { backend } from "@litespace/luna/backend";
import { getToken } from "@litespace/luna/cache";
import { IntlProvider } from "react-intl";
import { store, persistor } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackendProvider } from "@litespace/headless/backend";
import { AtlasProvider } from "@litespace/headless/atlas";
import { SocketProvider } from "@litespace/headless/socket";
import { AppConfigProvider } from "@litespace/headless/config";
import { PersistGate } from "redux-persist/integration/react";
import { ToastProvider } from "@litespace/luna/Toast";
import App from "@/App.tsx";

import "@litespace/luna/style.css";
import "@litespace/luna/tailwind.css";

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
          <BackendProvider backend={backend} getToken={getToken}>
            <AtlasProvider>
              <SocketProvider>
                <QueryClientProvider client={queryClient}>
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
                </QueryClientProvider>
              </SocketProvider>
            </AtlasProvider>
          </BackendProvider>
        </ToastProvider>
      </AppConfigProvider>
    </IntlProvider>
  </StrictMode>
);
