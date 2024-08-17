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

const router = createBrowserRouter([
  {
    path: Route.Root,
    element: <Root />,
    children: [
      { path: Route.Login, element: <Login /> },
      { path: Route.Register, element: <Register /> },
      { path: Route.TutorOnboarding, element: <TutorOnboarding /> },
      { path: Route.TutorProfile, element: <TutorProfile /> },
      { path: Route.Call, element: <Call /> },
      { path: Route.Complete, element: <Complete /> },
    ],
    errorElement: <ErrorPage />,
  },
]);

function App(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(profileSelector);

  useEffect(() => {
    dispatch(findProfile());
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;
    dispatch(findRooms(profile.id));
    if (profile.role === IUser.Role.Tutor) dispatch(findTutorMeta(profile.id));
  }, [dispatch, profile]);

  return <RouterProvider router={router} />;
}

export default App;
