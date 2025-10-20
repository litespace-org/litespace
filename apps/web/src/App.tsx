import React from "react";
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import * as Sentry from "@sentry/react";
import Splash from "@/pages/Splash";
import { lazyWithRetry } from "@/lib/lazy";

const Root = lazyWithRetry(() => import("@/pages/Root"));
const Login = lazyWithRetry(() => import("@/pages/Login"));
const Register = lazyWithRetry(() => import("@/pages/Register"));
const TutorProfile = lazyWithRetry(() => import("@/pages/TutorProfile"));
const CompleteProfile = lazyWithRetry(() => import("@/pages/CompleteProfile"));
const StudentDashboard = lazyWithRetry(
  () => import("@/pages/StudentDashboard")
);
const LessonsSchedule = lazyWithRetry(() => import("@/pages/LessonsSchedule"));
const StudentSettings = lazyWithRetry(() => import("@/pages/StudentSettings"));
const Payments = lazyWithRetry(() => import("@/pages/Payments"));
const Tutors = lazyWithRetry(() => import("@/pages/Tutors"));
const Chat = lazyWithRetry(() => import("@/pages/Chat"));
const Lessons = lazyWithRetry(() => import("@/pages/Lessons"));
const Plans = lazyWithRetry(() => import("@/pages/Plans"));
const Lesson = lazyWithRetry(() => import("@/pages/Lesson"));
const TutorAccountSettings = lazyWithRetry(
  () => import("@/pages/TutorAccountSettings")
);
const TutorProfileSettings = lazyWithRetry(
  () => import("@/pages/TutorProfileSettings")
);
const ScheduleManagement = lazyWithRetry(
  () => import("@/pages/ScheduleManagement")
);
const TutorDashboard = lazyWithRetry(() => import("@/pages/TutorDashboard"));
const Invoices = lazyWithRetry(() => import("@/pages/Invoices"));
const CardAdded = lazyWithRetry(() => import("@/pages/CardAdded"));
const Checkout = lazyWithRetry(() => import("@/pages/Checkout"));
const CompleteTutorProfile = lazyWithRetry(
  () => import("@/pages/CompleteTutorProfile")
);
const TutorOnboarding = lazyWithRetry(() => import("@/pages/TutorOnboarding"));
const Interview = lazyWithRetry(() => import("@/pages/Interview"));
const DemoSession = lazyWithRetry(() => import("@/pages/DemoSession"));
const Crash = lazyWithRetry(() => import("@/pages/Crash"));

const createRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);

function withCrash(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => ({
    ...route,
    element: route.element,
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
      { path: Web.StudentDashboard, element: <StudentDashboard /> },
      { path: Web.StudentSettings, element: <StudentSettings /> },
      { path: Web.TutorDashboard, element: <TutorDashboard /> },
      { path: Web.TutorAccountSettings, element: <TutorAccountSettings /> },
      { path: Web.TutorProfileSettings, element: <TutorProfileSettings /> },
      { path: Web.LessonsSchedule, element: <LessonsSchedule /> },
      { path: Web.ScheduleManagement, element: <ScheduleManagement /> },
      { path: Web.Plans, element: <Plans /> },
      { path: Web.TutorProfile, element: <TutorProfile /> },
      { path: Web.Tutors, element: <Tutors /> },
      { path: Web.Lessons, element: <Lessons /> },
      { path: Web.Lesson, element: <Lesson /> },
      { path: Web.CardAdded, element: <CardAdded /> },
      { path: Web.Checkout, element: <Checkout /> },
      { path: Web.CompleteTutorProfile, element: <CompleteTutorProfile /> },
      { path: Web.TutorOnboarding, element: <TutorOnboarding /> },
      { path: Web.Interview, element: <Interview /> },
      { path: Web.DemoSession, element: <DemoSession /> },
    ]),
    errorElement: <Splash children={<Crash screen />} />,
  },
]);

function App(): React.JSX.Element {
  return (
    <Splash position="top">
      <RouterProvider router={router} />;
    </Splash>
  );
}

export default App;
