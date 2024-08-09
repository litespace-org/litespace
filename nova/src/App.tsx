import React, { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ErrorPage from "@/pages/Error";
import { Route } from "@/types/routes";
import { useAppDispatch } from "@/redux/store";
import { findMe } from "@/redux/user/me";
import SelectUserType from "@/pages/SelectUserType";
import SelectUserGender from "@/pages/SelectUserGender";
import SetUserName from "@/pages/SetUserName";
import Tutors from "@/pages/Tutors";
import TutorProfile from "@/pages/TutorProfile";
import Call from "@/pages/Call";

const router = createBrowserRouter([
  { path: Route.Root, element: <Root />, errorElement: <ErrorPage /> },
  { path: Route.Login, element: <Login />, errorElement: <ErrorPage /> },
  { path: Route.Register, element: <Register />, errorElement: <ErrorPage /> },
  { path: Route.SelectUserType, element: <SelectUserType /> },
  { path: Route.SelectUserGender, element: <SelectUserGender /> },
  { path: Route.SetUserName, element: <SetUserName /> },
  { path: Route.Tutors, element: <Tutors /> },
  { path: Route.Call, element: <Call /> },
  { path: Route.TutorProfile, element: <TutorProfile /> },
]);

function App(): React.JSX.Element {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(findMe());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
