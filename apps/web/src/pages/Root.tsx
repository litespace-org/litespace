import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";
import { router } from "@/lib/routes";
import { useUser } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Landing, Web } from "@litespace/utils/routes";
import { dayjs, isForbidden } from "@litespace/utils";
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
import { WebrtcCheckDialog } from "@/components/Common/WebrtcCheckDialog";
import clarity, { getCustomeId, sessionId } from "@/lib/clarity";

const publicRoutes: Web[] = [
  Web.Login,
  Web.ForgetPassword,
  Web.ResetPassword,
  Web.Register,
  Web.CardAdded,
];

const Root: React.FC = () => {
  const mq = useMediaQuery();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { user, meta, error, logout } = useUser();

  /**
   * `nav` is a url param used to hide the page navigation. It is mainlly used
   * in the lesson page.
   */
  const [params] = useSearchParams({ nav: "true" });

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoute = useMemo(() => {
    return publicRoutes.some((route) => router.match(route, location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (!isForbidden(error) || publicRoute) return;
    navigate(Web.Login);
  }, [error, logout, navigate, publicRoute]);

  useEffect(() => {
    const root = router.match(Web.Root, location.pathname);
    if (!user && !publicRoute) return navigate(Web.Login);
    if (!user) return;

    const role = destructureRole(user.role);

    // ============ tutor redirect ========
    const tutor = role.tutor || role.tutorManager;
    const settings =
      router.match(Web.TutorProfileSettings, location.pathname) ||
      router.match(Web.TutorAccountSettings, location.pathname);
    const completedProfile =
      (!!meta && isProfileComplete({ ...user, ...meta })) || true;

    if (tutor && completedProfile && root) return navigate(Web.TutorDashboard);

    // @note: avoid redirecting the tutor to the complete tutor profile page in
    // case he was visiting a public route or his settings page.
    // @note: tutor should automatically be directed to
    if (tutor && !completedProfile && !settings && !publicRoute)
      return navigate(Web.CompleteTutorProfile);

    // @note: tutor should automatically be directed to the onboarding page
    // incase he didn't passed one or more of the onboarding flow steps. tutor
    // should only be redirected if his profile is completed.
    if (
      tutor &&
      completedProfile &&
      meta &&
      !settings &&
      !publicRoute &&
      !router.match(Web.Interview, location.pathname) &&
      !router.match(Web.DemoSession, location.pathname) &&
      !meta.bypassOnboarding &&
      (!meta.passedIntroVideo ||
        !meta.passedInterview ||
        !meta.passedDemoSession)
    )
      return navigate(Web.TutorOnboarding);

    // ============ student redirect ========
    if (role.student && root) {
      if (dayjs().isSame(user.createdAt, "day")) return navigate(Web.Tutors);
      return navigate(Web.StudentDashboard);
    }
  }, [navigate, location.pathname, user, publicRoute, meta]);

  const showNavigation = useMemo(() => {
    if (params.get("nav") === "false") return false;
    const routes: Web[] = [
      Web.Login,
      Web.Register,
      Web.ForgetPassword,
      Web.ResetPassword,
      Web.CompleteProfile,
      Web.CardAdded,
      Web.Checkout,
      Web.CompleteTutorProfile,
      Web.TutorOnboarding,
      Web.Interview,
      Web.DemoSession,
    ];
    const match = routes.some((route) =>
      router.match(route, location.pathname)
    );
    return !match;
  }, [location.pathname, params]);

  const fullScreenPage = useMemo(() => {
    const routes: Web[] = [Web.Lesson];
    return routes.some((route) => router.match(route, location.pathname));
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

  useEffect(() => {
    clarity.identify(getCustomeId(), sessionId, location.pathname);
  }, [location.pathname]);

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
        <WebrtcCheckDialog />
        {showNavigation ? (
          <Navbar toggleSidebar={() => setShowMobileSidebar((prev) => !prev)} />
        ) : null}

        <Outlet />
      </div>
    </div>
  );
};

export default Root;
