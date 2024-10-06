import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Route } from "@/lib/route";
import Root from "@/pages/Root";
import { ErrorPage } from "@litespace/luna";
import { useAppDispatch } from "@/redux/store";
import { useEffect } from "react";
import { findProfile } from "./redux/user/profile";
import Invoices from "@/pages/Invoices";
import Media from "@/pages/Media";

const router = createBrowserRouter([
  {
    path: Route.Root,
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: Route.Invoices, element: <Invoices /> },
      { path: Route.Media, element: <Media /> },
    ],
  },
]);

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(findProfile.call(null));
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
