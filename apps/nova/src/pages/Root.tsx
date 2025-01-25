import React, { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { destructureRole } from "@litespace/sol/user";
import { IUser } from "@litespace/types";
import cn from "classnames";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import { useUserContext } from "@litespace/headless/context/user";
import { useMediaQueries } from "@litespace/luna/hooks/media";

const registerRoutes = [IUser.Role.Student, IUser.Role.Tutor].map((role) =>
  Route.Register.replace(":role", role)
);

const Root: React.FC = () => {
  const { lg } = useMediaQueries();
  const { user, meta } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = location.pathname === Route.Root;
    const routes: string[] = [
      Route.Login,
      Route.VerifyEmail,
      Route.ForgetPassword,
      ...registerRoutes,
    ];
    const ignore = routes.some((route) => route === location.pathname);
    if (!user && !ignore) return navigate(Route.Login);
    if (!user || !root) return;
    const { tutor, student, tutorManager } = destructureRole(user.role);
    if (tutor || tutorManager) return navigate(Route.TutorDashboard);
    if (student) return navigate(Route.StudentDashboard);
  }, [navigate, location.pathname, user, meta]);

  const showNaviation = useMemo(() => {
    const routes: string[] = [
      Route.Login,
      Route.ForgetPassword,
      Route.ResetPassword,
      ...registerRoutes,
    ];
    return !routes.includes(location.pathname);
  }, [location.pathname]);

  return (
    <div
      className={cn("flex relative w-full", {
        "lg:ps-60": showNaviation,
      })}
    >
      {showNaviation && lg ? <Sidebar /> : null}
      <div
        className={cn("min-h-screen flex flex-col w-full overflow-x-hidden")}
      >
        {showNaviation ? <Navbar /> : null}
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
