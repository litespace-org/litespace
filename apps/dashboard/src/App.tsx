import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Route } from "@/lib/route";
import Root from "@/pages/Root";
import { ErrorPage } from "@litespace/luna";
import Invoices from "@/pages/Invoices";
import Media from "@/pages/Media";
import Login from "@/pages/Login";
import Plans from "./pages/Plans";

const router = createBrowserRouter([
  {
    path: Route.Root,
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: Route.Invoices, element: <Invoices /> },
      { path: Route.Media, element: <Media /> },
      { path: Route.Login, element: <Login /> },
      { path: Route.Plans, element: <Plans /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
