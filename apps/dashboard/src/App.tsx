import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Route } from "@/lib/route";
import Root from "@/pages/Root";
import { ErrorPage } from "@litespace/luna/components/ErrorPage";
import Invoices from "@/pages/Invoices";
import Media from "@/pages/Media";
import Login from "@/pages/Login";
import Plans from "@/pages/Plans";
import Users from "@/pages/Users";

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
      { path: Route.Users, element: <Users /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
