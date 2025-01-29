import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ErrorPage from "@/pages/Error";
import { Route } from "@/types/routes";
import TutorProfile from "@/pages/TutorProfile";
import TutorOnboarding from "@/pages/TutorOnboarding";
import Complete from "@/pages/Complete";
import StudentDashboard from "@/pages/StudentDashboard";
import LessonsSchedule from "@/pages/LessonsSchedule";
import Settings from "@/pages/Settings";
import Payments from "@/pages/Payments";
import Tutors from "@/pages/Tutors";
import Invoices from "@/pages/Invoices";
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

const router = createBrowserRouter([
  {
    path: Route.Root,
    element: <Root />,
    children: [
      { path: Route.Chat, element: <Chat /> },
      { path: Route.Complete, element: <Complete /> },
      { path: Route.Invoices, element: <Invoices /> },
      { path: Route.Login, element: <Login /> },
      { path: Route.Payments, element: <Payments /> },
      { path: Route.Register, element: <Register /> },
      { path: Route.ResetPassword, element: <ResetPassword /> },
      { path: Route.StudentDashboard, element: <StudentDashboard /> },
      { path: Route.StudentSettings, element: <Settings /> },
      { path: Route.TutorDashboard, element: <TutorDashboard /> },
      { path: Route.TutorSettings, element: <TutorSettings /> },
      { path: Route.LessonsSchedule, element: <LessonsSchedule /> },
      { path: Route.ScheduleManagement, element: <ScheduleManagement /> },
      { path: Route.Subscription, element: <Plans /> },
      { path: Route.TutorOnboarding, element: <TutorOnboarding /> },
      { path: Route.TutorProfile, element: <TutorProfile /> },
      { path: Route.Tutors, element: <Tutors /> },
      { path: Route.UpcomingLessons, element: <UpcomingLessons /> },
      { path: Route.Lesson, element: <Lesson /> },
      { path: Route.VerifyEmail, element: <VerifyEmail /> },
      { path: Route.ForgetPassword, element: <ForgetPassword /> },
    ],
    errorElement: <ErrorPage />,
  },
]);

function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
