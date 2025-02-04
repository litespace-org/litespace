import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { destructureRole } from "@litespace/utils/user";
import { IUser } from "@litespace/types";
import cn from "classnames";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import { useUserContext } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const registerRoutes = [IUser.Role.Student, IUser.Role.Tutor].map((role) =>
  Route.Register.replace(":role", role)
);

const Root: React.FC = () => {
  const { lg } = useMediaQuery();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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
      {showNaviation && (lg || showMobileSidebar) ? (
        <Sidebar hide={() => setShowMobileSidebar(false)} />
      ) : null}

      <div
        className={cn("min-h-screen flex flex-col w-full overflow-x-hidden", {
          "after:content-[''] after:absolute after:z-10 after:top-[72px] md:after:top-[88px] lg:after:top-0 after:bottom-0 after:right-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm":
            showMobileSidebar && !lg,
        })}
      >
        {showNaviation ? (
          <Navbar toggleSidebar={() => setShowMobileSidebar((prev) => !prev)} />
        ) : null}
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
