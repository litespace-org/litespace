import CompleteProfileBanner from "@/components/Layout/CompleteProfileBanner";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";
import { router } from "@/lib/routes";
import { useUserContext } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Landing, Web } from "@litespace/utils/routes";
import { isForbidden } from "@litespace/utils";
import { destructureRole, isRegularUser } from "@litespace/utils/user";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useSaveLogs } from "@/hooks/logger";
import { isProfileComplete } from "@litespace/utils/tutor";
import { useFindTutorMeta } from "@litespace/headless/tutor";
import CodeConfirmationDialog from "@/components/Common/CodeConfirmationDialog";

const publicRoutes: Web[] = [
  Web.Login,
  Web.VerifyEmail,
  Web.ForgetPassword,
  Web.ResetPassword,
  Web.Register,
  Web.TutorProfile,
  Web.CardAdded,
];

const Root: React.FC = () => {
  const mq = useMediaQuery();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user, meta, error, logout, set } = useUserContext();

  const tutorQuery = useFindTutorMeta(user?.id);
  useEffect(() => {
    set({ meta: tutorQuery.query.data || undefined });
  }, [tutorQuery, set]);

  /**
   * `nav` is a url param used to hide the page navigation. It is mainlly used
   * in the lesson page.
   */
  const [params] = useSearchParams({ nav: "true" });

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoute = useMemo(() => {
    return publicRoutes.some((route) =>
      router.isMatch.web(route, location.pathname)
    );
  }, [location.pathname]);

  useEffect(() => {
    if (!isForbidden(error) || publicRoute) return;
    navigate(Web.Login);
  }, [error, logout, navigate, publicRoute]);

  useEffect(() => {
    const root = location.pathname === Web.Root;
    if (!user && !publicRoute) return navigate(Web.Login);
    if (!user || !root) return;

    const { tutor, student, tutorManager } = destructureRole(user.role);

    if ((tutor || tutorManager) && !!meta) {
      return navigate(
        isProfileComplete({ ...user, ...meta })
          ? Web.TutorDashboard
          : Web.CompleteTutorProfile
      );
    }

    if (student) return navigate(Web.StudentDashboard);
  }, [navigate, location.pathname, user, publicRoute, meta]);

  const showNavigation = useMemo(() => {
    if (params.get("nav") === "false") return false;
    const routes: Web[] = [
      Web.Login,
      Web.Register,
      Web.ForgetPassword,
      Web.ResetPassword,
      Web.CompleteProfile,
      Web.VerifyEmail,
      Web.CardAdded,
      Web.Checkout,
      Web.CompleteTutorProfile,
    ];
    const match = routes.some((route) =>
      router.isMatch.web(route, location.pathname)
    );
    return !match;
  }, [location.pathname, params]);

  const fullScreenPage = useMemo(() => {
    const routes: Web[] = [
      Web.Lesson,
      // Web.Chat, // TODO: chat page should be added.
    ];
    return routes.some((route) => router.isMatch.web(route, location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const regularUser = isRegularUser(user);
    if (user && !regularUser) {
      logout();
      window.location.replace(
        router.landing({ route: Landing.Home, full: true })
      );
    }
  }, [logout, navigate, user]);

  useSaveLogs({
    enableKeyboardShortcut: true,
  });

  return (
    <div className="flex relative w-full">
      {showNavigation && (mq.md || showMobileSidebar) && !!user ? (
        <Sidebar hide={() => setShowMobileSidebar(false)} />
      ) : null}

      <div
        className={cn(
          "flex flex-col w-full overflow-x-hidden",
          fullScreenPage ? "h-screen overflow-hidden" : "min-h-screen",
          {
            "after:content-[''] after:absolute after:z-10 after:top-[72px] md:after:top-[88px] lg:after:top-0 after:bottom-0 after:right-0 after:left-0 after:bg-black after:bg-opacity-20 after:backdrop-blur-sm":
              showMobileSidebar && !mq.lg,
          }
        )}
      >
        <CompleteProfileBanner />

        {showNavigation ? (
          <Navbar toggleSidebar={() => setShowMobileSidebar((prev) => !prev)} />
        ) : null}

        <Outlet />

        <CodeConfirmationDialog />
      </div>
    </div>
  );
};

export default Root;
