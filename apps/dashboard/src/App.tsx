import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Route } from "@/lib/route";
import Root from "@/pages/Root";
import { ErrorPage } from "@litespace/luna/ErrorPage";
import Invoices from "@/pages/Invoices";
import Media from "@/pages/Media";
import Login from "@/pages/Login";
import Plans from "@/pages/Plans";
import Users from "@/pages/Users";
import ServerStats from "@/pages/ServerStats";
import Interviews from "@/pages/Interviews";
import UserDetails from "@/pages/UserDetails";
import { useAtlas } from "@litespace/headless/atlas";
import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { findCurrentUser } from "@/redux/user/profile";
import Lessons from "@/pages/Lessons";
import Settings from "@/pages/Settings";
import Topics from "@/pages/Topics";
import VerifyEmail from "@/pages/VerifyEmail";
import UserSettings from "./pages/UserSettings";

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
      { path: Route.User, element: <UserDetails /> },
      { path: Route.Interviews, element: <Interviews /> },
      { path: Route.Lessons, element: <Lessons /> },
      { path: Route.Topics, element: <Topics /> },
      { path: Route.ServerStats, element: <ServerStats /> },
      { path: Route.Settings, element: <Settings /> },
      { path: Route.VerifyEmail, element: <VerifyEmail /> },
      { path: Route.UserSetting, element: <UserSettings /> },
    ],
  },
]);

function App() {
  const atlas = useAtlas();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(findCurrentUser.call(atlas));
  }, [atlas, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
