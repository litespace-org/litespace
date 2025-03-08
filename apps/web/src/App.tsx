import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ErrorPage from "@/pages/Error";
import TutorProfile from "@/pages/TutorProfile";
import CompleteProfile from "@/pages/CompleteProfile";
import StudentDashboard from "@/pages/StudentDashboard";
import LessonsSchedule from "@/pages/LessonsSchedule";
import StudentSettings from "@/pages/StudentSettings";
import Payments from "@/pages/Payments";
import Tutors from "@/pages/Tutors";
import Chat from "@/pages/Chat";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import UpcomingLessons from "@/pages/UpcomingLessons";
import Plans from "@/pages/Plans";
import Lesson from "@/pages/Lesson";
import TutorSettings from "@/pages/TutorSettings";
import ScheduleManagement from "@/pages/ScheduleManagement";
import ForgetPassword from "@/pages/ForgetPassword";
import TutorDashboard from "@/pages/TutorDashboard";
import { Web } from "@litespace/utils/routes";
import * as Sentry from "@sentry/react";

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

function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
