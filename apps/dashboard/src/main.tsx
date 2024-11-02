import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import Spinner from "@litespace/luna/icons/spinner";
import { locales } from "@litespace/luna/locales";
import { backend, getToken } from "@litespace/luna/lib";
import { IntlProvider } from "react-intl";
import { store, persistor } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackendProvider } from "@litespace/headless/backend";
import { AtlasProvider } from "@litespace/headless/atlas";
import { PersistGate } from "redux-persist/integration/react";
import App from "@/App.tsx";
import "@litespace/luna/style.css";
import "@litespace/luna/tailwind.css";
import "react-toastify/dist/ReactToastify.min.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <BackendProvider backend={backend} getToken={getToken}>
        <AtlasProvider>
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
        </AtlasProvider>
      </BackendProvider>
    </IntlProvider>
  </StrictMode>
);
