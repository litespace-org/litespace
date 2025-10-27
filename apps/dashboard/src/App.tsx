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
const User = lazy(() => import("@/pages/User"));
const Lessons = lazy(() => import("@/pages/Lessons"));
const PlatformSettings = lazy(() => import("@/pages/PlatformSettings"));
const Topics = lazy(() => import("@/pages/Topics"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const PhotoSessions = lazy(() => import("@/pages/PhotoSessions"));
const PhotoSession = lazy(() => import("@/pages/PhotoSession"));
const Tutor = lazy(() => import("@/pages/Tutor"));
const Tutors = lazy(() => import("@/pages/Tutors"));
const PlanInvites = lazy(() => import("@/pages/PlanInvites"));
const Lesson = lazy(() => import("@/pages/Lesson"));
const AdMessage = lazy(() => import("@/pages/AdMessage"));
const Main = lazy(() => import("@/pages/Main"));

const router = createBrowserRouter([
  {
    path: Dashboard.Root,
    element: <Page page={<Root />} />,
    errorElement: <Page page={<ErrorPage />} />,
    children: [
      { path: Dashboard.Main, element: <Page page={<Main />} /> },
      { path: Dashboard.Invoices, element: <Page page={<Invoices />} /> },
      { path: Dashboard.Login, element: <Page page={<Login />} /> },
      { path: Dashboard.Plans, element: <Page page={<Plans />} /> },
      { path: Dashboard.Users, element: <Page page={<Users />} /> },
      { path: Dashboard.Tutors, element: <Page page={<Tutors />} /> },
      { path: Dashboard.User, element: <Page page={<User />} /> },
      { path: Dashboard.Interviews, element: <Page page={<Interviews />} /> },
      { path: Dashboard.Lessons, element: <Page page={<Lessons />} /> },
      { path: Dashboard.Topics, element: <Page page={<Topics />} /> },
      {
        path: Dashboard.PlatformSettings,
        element: <Page page={<PlatformSettings />} />,
      },
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
      {
        path: Dashboard.PlanInvites,
        element: <Page page={<PlanInvites />} />,
      },
      {
        path: Dashboard.Lesson,
        element: <Page page={<Lesson />} />,
      },
      {
        path: Dashboard.AdMessage,
        element: <Page page={<AdMessage />} />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
