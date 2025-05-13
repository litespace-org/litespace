import React, { lazy } from "react";
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import * as Sentry from "@sentry/react";
import Splash from "@/pages/Splash";

const Root = lazy(() => import("@/pages/Root"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Crash = lazy(() => import("@/pages/Crash"));
const TutorProfile = lazy(() => import("@/pages/TutorProfile"));
const CompleteProfile = lazy(() => import("@/pages/CompleteProfile"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const LessonsSchedule = lazy(() => import("@/pages/LessonsSchedule"));
const StudentSettings = lazy(() => import("@/pages/StudentSettings"));
const Payments = lazy(() => import("@/pages/Payments"));
const Tutors = lazy(() => import("@/pages/Tutors"));
const Chat = lazy(() => import("@/pages/Chat"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const UpcomingLessons = lazy(() => import("@/pages/UpcomingLessons"));
const Plans = lazy(() => import("@/pages/Plans"));
const PlansV2 = lazy(() => import("@/pages/PlansV2"));
const Lesson = lazy(() => import("@/pages/Lesson"));
const TutorSettings = lazy(() => import("@/pages/TutorSettings"));
const ScheduleManagement = lazy(() => import("@/pages/ScheduleManagement"));
const ForgetPassword = lazy(() => import("@/pages/ForgetPassword"));
const TutorDashboard = lazy(() => import("@/pages/TutorDashboard"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const CardAdded = lazy(() => import("@/pages/CardAdded"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const CompleteTutorProfile = lazy(() => import("@/pages/CompleteTutorProfile"));

const createRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);

function withCrash(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => ({
    ...route,
    element: <Splash children={route.element} position="top" />,
    errorElement: <Splash children={<Crash />} position="top" />,
  }));
}

const router = createRouter([
  {
    path: Web.Root,
    element: <Splash children={<Root />} />,
    children: withCrash([
      { path: Web.Chat, element: <Chat /> },
      { path: Web.Invoices, element: <Invoices /> },
      { path: Web.CompleteProfile, element: <CompleteProfile /> },
      { path: Web.Login, element: <Login /> },
      { path: Web.Payments, element: <Payments /> },
      { path: Web.Register, element: <Register /> },
      { path: Web.ResetPassword, element: <ResetPassword /> },
      { path: Web.StudentDashboard, element: <StudentDashboard /> },
      { path: Web.StudentSettings, element: <StudentSettings /> },
      { path: Web.TutorDashboard, element: <TutorDashboard /> },
      { path: Web.TutorSettings, element: <TutorSettings /> },
      { path: Web.LessonsSchedule, element: <LessonsSchedule /> },
      { path: Web.ScheduleManagement, element: <ScheduleManagement /> },
      { path: Web.Plans, element: <Plans /> },
      { path: Web.PlansV2, element: <PlansV2 /> },
      { path: Web.TutorProfile, element: <TutorProfile /> },
      { path: Web.Tutors, element: <Tutors /> },
      { path: Web.UpcomingLessons, element: <UpcomingLessons /> },
      { path: Web.Lesson, element: <Lesson /> },
      { path: Web.VerifyEmail, element: <VerifyEmail /> },
      { path: Web.ForgetPassword, element: <ForgetPassword /> },
      { path: Web.CardAdded, element: <CardAdded /> },
      { path: Web.Checkout, element: <Checkout /> },
      { path: Web.CompleteTutorProfile, element: <CompleteTutorProfile /> },
    ]),
    errorElement: <Splash children={<Crash screen />} />,
  },
]);

function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
