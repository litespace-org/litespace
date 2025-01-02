import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ErrorPage from "@/pages/Error";
import { Route } from "@/types/routes";
import TutorProfile from "@/pages/TutorProfile";
import TutorOnboarding from "@/pages/TutorOnboarding";
import Call from "@/pages/Call";
import Complete from "@/pages/Complete";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Settings from "@/pages/Settings";
import Payments from "@/pages/Payments";
import EditSchedule from "@/pages/EditSchedule";
import Tutors from "@/pages/Tutors";
import Interviews from "@/pages/Interviews";
import Invoices from "@/pages/Invoices";
import Chat from "@/pages/Chat";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import UpcomingLessons from "@/pages/UpcomingLessons";
import Plans from "@/pages/Plans";
import Lesson from "@/pages/Lesson";

const router = createBrowserRouter([
  {
    path: Route.Root,
    element: <Root />,
    children: [
      { path: Route.Call, element: <Call /> },
      { path: Route.Chat, element: <Chat /> },
      { path: Route.Complete, element: <Complete /> },
      { path: Route.Dashboard, element: <Dashboard /> },
      { path: Route.EditSchedule, element: <EditSchedule /> },
      { path: Route.Interviews, element: <Interviews /> },
      { path: Route.Invoices, element: <Invoices /> },
      { path: Route.Login, element: <Login /> },
      { path: Route.Payments, element: <Payments /> },
      { path: Route.Register, element: <Register /> },
      { path: Route.ResetPassword, element: <ResetPassword /> },
      { path: Route.Settings, element: <Settings /> },
      { path: Route.Schedule, element: <Schedule /> },
      { path: Route.Subscription, element: <Plans /> },
      { path: Route.TutorOnboarding, element: <TutorOnboarding /> },
      { path: Route.TutorProfile, element: <TutorProfile /> },
      { path: Route.Tutors, element: <Tutors /> },
      { path: Route.UpcomingLessons, element: <UpcomingLessons /> },
      { path: Route.Lesson, element: <Lesson /> },
      { path: Route.VerifyEmail, element: <VerifyEmail /> },
    ],
    errorElement: <ErrorPage />,
  },
]);

function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
