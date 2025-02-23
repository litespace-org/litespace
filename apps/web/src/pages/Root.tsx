import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { destructureRole } from "@litespace/utils/user";
import { IUser } from "@litespace/types";
import cn from "classnames";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";
import { useUserContext } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

const registerRoutes = [
  router.web({ route: Web.Register, role: IUser.Role.Student }),
  router.web({ route: Web.Register, role: IUser.Role.Tutor }),
];

const Root: React.FC = () => {
  const mq = useMediaQuery();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user, meta } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = location.pathname === Web.Root;
    const routes: string[] = [
      Web.Login,
      Web.VerifyEmail,
      Web.ForgetPassword,
      Web.ResetPassword,
      ...registerRoutes,
    ];
    const ignore = routes.some((route) => route === location.pathname);
    if (!user && !ignore) return navigate(Web.Login);
    if (!user || !root) return;
    const { tutor, student, tutorManager } = destructureRole(user.role);
    if (tutor || tutorManager) return navigate(Web.TutorDashboard);
    if (student) return navigate(Web.StudentDashboard);
  }, [navigate, location.pathname, user, meta]);

  const showNavigation = useMemo(() => {
    const routes: string[] = [
      Web.Login,
      Web.ForgetPassword,
      Web.ResetPassword,
      Web.CompleteProfile,
      ...registerRoutes,
    ];
    return !routes.includes(location.pathname);
  }, [location.pathname]);

  return (
    <div
      className={cn("flex relative w-full", {
        "lg:ps-60": showNavigation,
      })}
    >
      {showNavigation && (mq.lg || showMobileSidebar) ? (
        <Sidebar hide={() => setShowMobileSidebar(false)} />
      ) : null}

      <div
        className={cn("min-h-screen flex flex-col w-full overflow-x-hidden", {
          "after:content-[''] after:absolute after:z-10 after:top-[72px] md:after:top-[88px] lg:after:top-0 after:bottom-0 after:right-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm":
            showMobileSidebar && !mq.lg,
        })}
      >
        {showNavigation ? (
          <Navbar toggleSidebar={() => setShowMobileSidebar((prev) => !prev)} />
        ) : null}
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
