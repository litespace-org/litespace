import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Route } from "@/lib/route";
import Root from "@/pages/Root";
import { ErrorPage } from "@litespace/luna";
import { useAppDispatch } from "@/redux/store";
import { useEffect } from "react";
import { findProfile } from "./redux/user/profile";

const router = createBrowserRouter([
  {
    path: Route.Root,
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [],
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
