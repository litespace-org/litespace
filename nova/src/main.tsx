import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { locales } from "@litespace/luna";
import { IntlProvider } from "react-intl";
import { store } from "@/redux/store";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "@/App";

import "@litespace/luna/style.css";
import "@/index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <IntlProvider
    messages={locales["ar-EG"]}
    locale="ar-EG"
    defaultLocale="ar-EG"
  >
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <App />
      </ReduxProvider>
    </QueryClientProvider>
  </IntlProvider>
  // </React.StrictMode>
);
