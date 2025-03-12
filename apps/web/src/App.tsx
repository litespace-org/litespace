import React, { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Web } from "@litespace/utils/routes";
import * as Sentry from "@sentry/react";
import { Loader } from "@litespace/ui/Loading";

const Root = lazy(() => import("@/pages/Root"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ErrorPage = lazy(() => import("@/pages/Error"));
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
const Lesson = lazy(() => import("@/pages/Lesson"));
const TutorSettings = lazy(() => import("@/pages/TutorSettings"));
const ScheduleManagement = lazy(() => import("@/pages/ScheduleManagement"));
const ForgetPassword = lazy(() => import("@/pages/ForgetPassword"));
const TutorDashboard = lazy(() => import("@/pages/TutorDashboard"));
const Invoices = lazy(() => import("@/pages/Invoices"));

const createRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);

const Fallback: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="h-screen w-full">
        <div className="mt-[20vh]">
          <Loader size="medium" />
        </div>
      </div>
    }
  >
    {children}
  </Suspense>
);

const router = createRouter([
  {
    path: Web.Root,
    element: <Fallback children={<Root />} />,
    children: [
      { path: Web.Chat, element: <Fallback children={<Chat />} /> },
      { path: Web.Invoices, element: <Fallback children={<Invoices />} /> },
      { path: Web.Invoices, element: <Fallback children={<Invoices />} /> },
      {
        path: Web.CompleteProfile,
        element: <Fallback children={<CompleteProfile />} />,
      },
      { path: Web.Login, element: <Fallback children={<Login />} /> },
      { path: Web.Payments, element: <Fallback children={<Payments />} /> },
      { path: Web.Register, element: <Fallback children={<Register />} /> },
      {
        path: Web.ResetPassword,
        element: <Fallback children={<ResetPassword />} />,
      },
      {
        path: Web.StudentDashboard,
        element: <Fallback children={<StudentDashboard />} />,
      },
      {
        path: Web.StudentSettings,
        element: <Fallback children={<StudentSettings />} />,
      },
      {
        path: Web.TutorDashboard,
        element: <Fallback children={<TutorDashboard />} />,
      },
      {
        path: Web.TutorSettings,
        element: <Fallback children={<TutorSettings />} />,
      },
      {
        path: Web.LessonsSchedule,
        element: <Fallback children={<LessonsSchedule />} />,
      },
      {
        path: Web.ScheduleManagement,
        element: <Fallback children={<ScheduleManagement />} />,
      },
      { path: Web.Subscription, element: <Fallback children={<Plans />} /> },
      {
        path: Web.TutorProfile,
        element: <Fallback children={<TutorProfile />} />,
      },
      { path: Web.Tutors, element: <Fallback children={<Tutors />} /> },
      {
        path: Web.UpcomingLessons,
        element: <Fallback children={<UpcomingLessons />} />,
      },
      { path: Web.Lesson, element: <Fallback children={<Lesson />} /> },
      {
        path: Web.VerifyEmail,
        element: <Fallback children={<VerifyEmail />} />,
      },
      {
        path: Web.ForgetPassword,
        element: <Fallback children={<ForgetPassword />} />,
      },
    ],
    errorElement: <Fallback children={<ErrorPage />} />,
  },
]);

function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
