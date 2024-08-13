import React, { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ErrorPage from "@/pages/Error";
import { Route } from "@/types/routes";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findMe, profileSelector } from "@/redux/user/me";
import TutorProfile from "@/pages/TutorProfile";
import TutorOnboarding from "@/pages/TutorOnboarding";
import Call from "@/pages/Call";
import { findRooms } from "./redux/chat/rooms";

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
    ],
    errorElement: <ErrorPage />,
  },
]);

function App(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(profileSelector);

  useEffect(() => {
    dispatch(findMe());
  }, [dispatch]);

  useEffect(() => {
    if (!profile) return;
    dispatch(findRooms(profile.id));
  }, [dispatch, profile]);

  return <RouterProvider router={router} />;
}

export default App;
