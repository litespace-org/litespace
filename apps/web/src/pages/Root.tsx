import CompleteProfileBanner from "@/components/Layout/CompleteProfileBanner";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";
import clarity from "@/lib/clarity";
import { router } from "@/lib/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Landing, Web } from "@litespace/utils/routes";
import { isForbidden } from "@litespace/utils";
import { destructureRole, isRegularUser } from "@litespace/utils/user";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const publicRoutes: Web[] = [
  Web.Login,
  Web.VerifyEmail,
  Web.ForgetPassword,
  Web.ResetPassword,
  Web.Register,
  Web.TutorProfile,
];

const Root: React.FC = () => {
  const mq = useMediaQuery();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user, error, logout } = useUserContext();

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoute = useMemo(() => {
    return publicRoutes.some((route) =>
      router.isMatch.web(route, location.pathname)
    );
  }, [location.pathname]);

  useEffect(() => {
    if (!isForbidden(error) || publicRoute) return;
    logout();
    navigate(Web.Login);
  }, [error, logout, navigate, publicRoute]);

  useEffect(() => {
    const root = location.pathname === Web.Root;
    if (!user && !publicRoute) return navigate(Web.Login);
    if (!user || !root) return;
    const { tutor, student, tutorManager } = destructureRole(user.role);
    if (tutor || tutorManager) return navigate(Web.TutorDashboard);
    if (student) return navigate(Web.StudentDashboard);
  }, [navigate, location.pathname, user, publicRoute]);

  const showNavigation = useMemo(() => {
    const routes: Web[] = [
      Web.Login,
      Web.Register,
      Web.ForgetPassword,
      Web.ResetPassword,
      Web.CompleteProfile,
      Web.VerifyEmail,
    ];
    const match = routes.some((route) =>
      router.isMatch.web(route, location.pathname)
    );
    return !match;
  }, [location.pathname]);

  useEffect(() => {
    const customeId = user?.id.toString() || "un-authorized";
    clarity.identify(customeId);
  }, [user?.id]);

  useEffect(() => {
    const regularUser = isRegularUser(user);
    if (user && !regularUser)
      window.location.replace(
        router.landing({ route: Landing.Home, full: true })
      );
  }, [navigate, user]);

  return (
    <div className="flex relative w-full">
      {showNavigation && (mq.md || showMobileSidebar) && !!user ? (
        <Sidebar hide={() => setShowMobileSidebar(false)} />
      ) : null}

      <div
        className={cn("min-h-screen flex flex-col w-full overflow-x-hidden", {
          "after:content-[''] after:absolute after:z-10 after:top-[72px] md:after:top-[88px] lg:after:top-0 after:bottom-0 after:right-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm":
            showMobileSidebar && !mq.lg,
        })}
      >
        <CompleteProfileBanner />
        {showNavigation ? (
          <Navbar toggleSidebar={() => setShowMobileSidebar((prev) => !prev)} />
        ) : null}
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
