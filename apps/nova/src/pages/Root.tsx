import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Route, RoutePatterns } from "@/types/routes";
import { destructureRole } from "@litespace/sol/user";
import { IUser } from "@litespace/types";
import UrlPattern from "url-pattern";
import cn from "classnames";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import { useUserContext } from "@litespace/headless/context/user";

const Root: React.FC = () => {
  const { user, meta } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const call = new UrlPattern(RoutePatterns.Call);
    const login = new UrlPattern(RoutePatterns.Login);
    const register = new UrlPattern(RoutePatterns.Register);
    const resetPassword = new UrlPattern(RoutePatterns.ResetPassword);
    const verifyEmail = new UrlPattern(RoutePatterns.VerifyEmail);
    const root = location.pathname === "/";
    const complete = location.pathname === Route.Complete;
    const ignore = [call, login, register, resetPassword, verifyEmail].some(
      (patten) => patten.match(location.pathname)
    );

    if (!user && !ignore) return navigate(Route.Login);

    // redirect the user to complete his profile
    // redirect student in case of missing: name, age
    // redirect tutor in case of missing: name, age, gender
    const redirectStudent =
      user &&
      user.role === IUser.Role.Student &&
      [user.name, user.birthYear].some((value) => value === null);
    const redirectTutor =
      user &&
      user.role === IUser.Role.Tutor &&
      [user.name, user.birthYear, user.gender].some((value) => value === null);
    if (redirectStudent || redirectTutor) return navigate(Route.Complete);

    if (
      !ignore &&
      user &&
      user.role === IUser.Role.Tutor &&
      meta &&
      (meta.bio === null ||
        meta.about === null ||
        user.image === null ||
        meta.video === null)
    )
      return navigate(Route.TutorOnboarding);

    if (!user || (!root && !complete)) return;
    const { tutor, student, tutorManager } = destructureRole(user.role);
    if (tutor || student) return navigate(Route.UpcomingLessons);
    if (tutorManager) return navigate(Route.Interviews);
  }, [navigate, location.pathname, user, meta]);

  return (
    <div className="flex relative ps-60 w-full">
      <Sidebar />
      <div
        className={cn("min-h-screen flex flex-col w-full overflow-x-hidden")}
      >
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
