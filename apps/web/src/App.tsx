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

const createRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);

const router = createRouter([
  {
    path: Web.Root,
    element: <Root />,
    children: [
      { path: Web.Chat, element: <Chat /> },
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
      { path: Web.Subscription, element: <Plans /> },
      { path: Web.TutorProfile, element: <TutorProfile /> },
      { path: Web.Tutors, element: <Tutors /> },
      { path: Web.UpcomingLessons, element: <UpcomingLessons /> },
      { path: Web.Lesson, element: <Lesson /> },
      { path: Web.VerifyEmail, element: <VerifyEmail /> },
      { path: Web.ForgetPassword, element: <ForgetPassword /> },
    ],
    errorElement: <ErrorPage />,
  },
]);

const Fallback: React.FC = () => (
  <div className="h-screen w-full">
    <div className="mt-[20vh]">
      <Loader size="medium" />
    </div>
  </div>
);

function App(): React.JSX.Element {
  return (
    <Suspense fallback={<Fallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
