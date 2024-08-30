import React, { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ErrorPage from "@/pages/Error";
import { Route } from "@/types/routes";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findProfile, profileSelector } from "@/redux/user/me";
import TutorProfile from "@/pages/TutorProfile";
import TutorOnboarding from "@/pages/TutorOnboarding";
import Call from "@/pages/Call";
import Complete from "@/pages/Complete";
import { findRooms } from "./redux/chat/rooms";
import { IUser } from "@litespace/types";
import { findTutorMeta } from "@/redux/user/tutor";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Settings from "@/pages/Settings";
import Payments from "@/pages/Payments";
import EditSchedule from "@/pages/EditSchedule";
import { findUserRules } from "@/redux/user/schedule";
import Tutors from "@/pages/Tutors";

const router = createBrowserRouter([
  { path: Route.Login, element: <Login />, errorElement: <ErrorPage /> },
  { path: Route.Register, element: <Register />, errorElement: <ErrorPage /> },
  { path: Route.Complete, element: <Complete />, errorElement: <ErrorPage /> },
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
    ],
    errorElement: <ErrorPage />,
  },
]);

function App(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(profileSelector);

  useEffect(() => {
    dispatch(findProfile.call(null));
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;
    const tutor = profile.role === IUser.Role.Tutor;
    const interviewer = profile.role === IUser.Role.Interviewer;
    dispatch(findRooms.call(profile.id));
    if (tutor) dispatch(findTutorMeta.call(profile.id));
    if (tutor || interviewer) dispatch(findUserRules.call(profile.id));
  }, [dispatch, profile]);

  return <RouterProvider router={router} />;
}

export default App;
