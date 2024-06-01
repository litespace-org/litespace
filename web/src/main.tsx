import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "@/pages/Root";
import ErrorPage from "@/pages/Error";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { Provider as ReduxProvider } from "react-redux";
import { locales } from "@litespace/uilib";
import { IntlProvider } from "react-intl";
import { store } from "@/redux/store";
import { Route } from "@/types/routes";
import { QueryClient, QueryClientProvider } from "react-query";

import "@litespace/uilib/style.css";
import "@/index.css";

const router = createBrowserRouter([
  { path: Route.Root, element: <Root />, errorElement: <ErrorPage /> },
  { path: Route.Login, element: <Login />, errorElement: <ErrorPage /> },
  { path: Route.Register, element: <Register />, errorElement: <ErrorPage /> },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IntlProvider
      messages={locales["ar-EG"]}
      locale="ar-EG"
      defaultLocale="ar-EG"
    >
      <QueryClientProvider client={queryClient}>
        <ReduxProvider store={store}>
          <RouterProvider router={router} />
        </ReduxProvider>
      </QueryClientProvider>
    </IntlProvider>
  </React.StrictMode>
);
