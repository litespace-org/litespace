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
import Lessons from "@/pages/Lessons";
import Tutors from "@/pages/Tutors";
import Interviews from "@/pages/Interviews";
import Invoices from "@/pages/Invoices";
import Chat from "@/pages/Chat";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";

const router = createBrowserRouter([
  {
    path: Route.Root,
    element: <Root />,
    children: [
      { path: Route.TutorOnboarding, element: <TutorOnboarding /> },
      { path: Route.TutorProfile, element: <TutorProfile /> },
      { path: Route.Call, element: <Call /> },
      { path: Route.Dashboard, element: <Dashboard /> },
      { path: Route.Schedule, element: <Schedule /> },
      { path: Route.EditSchedule, element: <EditSchedule /> },
      { path: Route.Settings, element: <Settings /> },
      { path: Route.Payments, element: <Payments /> },
      { path: Route.Tutors, element: <Tutors /> },
      { path: Route.Lessons, element: <Lessons /> },
      { path: Route.Interviews, element: <Interviews /> },
      { path: Route.Invoices, element: <Invoices /> },
      { path: Route.Chat, element: <Chat /> },
      { path: Route.Login, element: <Login /> },
      { path: Route.Register, element: <Register /> },
      { path: Route.Complete, element: <Complete /> },
      { path: Route.ResetPassword, element: <ResetPassword /> },
      { path: Route.VerifyEmail, element: <VerifyEmail /> },
    ],
    errorElement: <ErrorPage />,
  },
]);

function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
