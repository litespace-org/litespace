import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorPage } from "@litespace/ui/ErrorPage";
import { lazy } from "react";
import { Dashboard } from "@litespace/utils/routes";
import Page from "@/components/Layout/Page";

const Root = lazy(() => import("@/pages/Root"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const Login = lazy(() => import("@/pages/Login"));
const Plans = lazy(() => import("@/pages/Plans"));
const Users = lazy(() => import("@/pages/Users"));
const Interviews = lazy(() => import("@/pages/Interviews"));
const UserDetails = lazy(() => import("@/pages/UserDetails"));
const Lessons = lazy(() => import("@/pages/Lessons"));
const PlatformSettings = lazy(() => import("@/pages/PlatformSettings"));
const Topics = lazy(() => import("@/pages/Topics"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const PhotoSessions = lazy(() => import("@/pages/PhotoSessions"));
const PhotoSession = lazy(() => import("@/pages/PhotoSession"));
const Tutor = lazy(() => import("@/pages/Tutor"));

const router = createBrowserRouter([
  {
    path: Dashboard.Root,
    element: <Page page={<Root />} />,
    errorElement: <Page page={<ErrorPage />} />,
    children: [
      { path: Dashboard.Invoices, element: <Page page={<Invoices />} /> },
      { path: Dashboard.Login, element: <Page page={<Login />} /> },
      { path: Dashboard.Plans, element: <Page page={<Plans />} /> },
      { path: Dashboard.Users, element: <Page page={<Users />} /> },
      { path: Dashboard.User, element: <Page page={<UserDetails />} /> },
      { path: Dashboard.Interviews, element: <Page page={<Interviews />} /> },
      { path: Dashboard.Lessons, element: <Page page={<Lessons />} /> },
      { path: Dashboard.Topics, element: <Page page={<Topics />} /> },
      {
        path: Dashboard.PlatformSettings,
        element: <Page page={<PlatformSettings />} />,
      },
      { path: Dashboard.VerifyEmail, element: <Page page={<VerifyEmail />} /> },
      {
        path: Dashboard.UserSetting,
        element: <Page page={<UserSettings />} />,
      },
      {
        path: Dashboard.PhotoSession,
        element: <Page page={<PhotoSession />} />,
      },
      {
        path: Dashboard.PhotoSessions,
        element: <Page page={<PhotoSessions />} />,
      },
      {
        path: Dashboard.Tutor,
        element: <Page page={<Tutor />} />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
