import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "@/pages/Root";
import { ErrorPage } from "@litespace/ui/ErrorPage";
import Invoices from "@/pages/Invoices";
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
import PlatformSettings from "@/pages/PlatformSettings";
import Topics from "@/pages/Topics";
import VerifyEmail from "@/pages/VerifyEmail";
import UserSettings from "@/pages/UserSettings";
import { Dashboard } from "@litespace/utils/routes";

const router = createBrowserRouter([
  {
    path: Dashboard.Root,
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: Dashboard.Invoices, element: <Invoices /> },
      { path: Dashboard.Login, element: <Login /> },
      { path: Dashboard.Plans, element: <Plans /> },
      { path: Dashboard.Users, element: <Users /> },
      { path: Dashboard.User, element: <UserDetails /> },
      { path: Dashboard.Interviews, element: <Interviews /> },
      { path: Dashboard.Lessons, element: <Lessons /> },
      { path: Dashboard.Topics, element: <Topics /> },
      { path: Dashboard.ServerStats, element: <ServerStats /> },
      { path: Dashboard.PlatformSettings, element: <PlatformSettings /> },
      { path: Dashboard.VerifyEmail, element: <VerifyEmail /> },
      { path: Dashboard.UserSetting, element: <UserSettings /> },
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
