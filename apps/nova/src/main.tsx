import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { Spinner, backend, getToken, locales } from "@litespace/luna";
import { IntlProvider } from "react-intl";
import { store, persistor } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/constants/auth";
import { AtlasProvider } from "@litespace/headless/atlas";
import App from "@/App";

import "@litespace/luna/style.css";
import "@litespace/luna/tailwind.css";
import "react-toastify/dist/ReactToastify.min.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <IntlProvider
    messages={locales["ar-EG"]}
    locale="ar-EG"
    defaultLocale="ar-EG"
  >
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AtlasProvider backend={backend} getToken={getToken}>
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
        </AtlasProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </IntlProvider>
);
