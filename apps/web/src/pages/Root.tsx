import { InvalidTimeDialog } from "@/components/Common/InvalidTimeDialog";
import FloatingButtons from "@/components/Layout/FloatingButtons";
import Navbar from "@/components/Layout/Navbar";
import Sidebar from "@/components/Layout/Sidebar";
import { CacheKey } from "@/constants/cache";
import { StudentDashboardTour } from "@/constants/tour";
import { useSaveLogs } from "@/hooks/logger";
import { useTour } from "@/hooks/tour";
import { identify } from "@/lib/analytics";
import { cache } from "@/lib/cache";
import clarity, { getCustomeId, sessionId } from "@/lib/clarity";
import { router } from "@/lib/routes";
import Exit from "@litespace/assets/Exit";
import { useUser } from "@litespace/headless/context/user";
import { Button } from "@litespace/ui/Button";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { dayjs, isForbidden } from "@litespace/utils";
import { Landing, Web } from "@litespace/utils/routes";
import { isProfileComplete } from "@litespace/utils/tutor";
import { destructureRole, isRegularUser } from "@litespace/utils/user";
import cn from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Splash from "@/pages/Splash";

const publicRoutes: Web[] = [
  Web.Login,
  Web.ForgetPassword,
  Web.ResetPassword,
  Web.Register,
  Web.CardAdded,
];

const Root: React.FC = () => {
  const { user, meta, error, logout } = useUser();
  const intl = useFormatMessage();

  const [stepNumber, setStepNumber] = useState(0);
  const [tourDialogOpen, setTourDialogOpen] = useState<boolean>(false);

  const tourConfig = useMemo(
    () => ({
      nextButton: <Button size="large">{intl("labels.next")}</Button>,
      prevButton: (
        <Button className="!bg-natural-0" size="large" variant="secondary">
          {intl("labels.prev")}
        </Button>
      ),
      onStop: () => {
        setTourDialogOpen(true);
        cache.save(CacheKey.TourFinished, true);
      },
      onNext: () => setStepNumber((prev) => prev + 1),
      onPrev: () => setStepNumber((prev) => prev - 1),
    }),
    [intl]
  );

  const studentTour = useTour(StudentDashboardTour, tourConfig);

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
    // if (
    //   tutor &&
    //   completedProfile &&
    //   meta &&
    //   !settings &&
    //   !publicRoute &&
    //   !router.match(Web.Interview, location.pathname) &&
    //   !router.match(Web.DemoSession, location.pathname) &&
    //   !meta.bypassOnboarding &&
    //   (!meta.passedIntroVideo ||
    //     !meta.passedInterview ||
    //     !meta.passedDemoSession)
    // )
    //   return navigate(Web.TutorOnboarding);

    // ============ student redirect ========
    if (role.student && root) {
      if (
        dayjs().isSame(user.createdAt, "day") &&
        !cache.load(CacheKey.TourFinished)
      ) {
        navigate(Web.Tutors);
        studentTour.start();
        return;
      }
      return navigate(Web.StudentDashboard);
    }
  }, [navigate, location.pathname, user, publicRoute, meta, studentTour]);

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
    clarity.identify(
      user?.id.toString() || getCustomeId(),
      sessionId,
      location.pathname,
      user?.name || undefined
    );
  }, [location.pathname, user?.id, user?.name]);

  useEffect(() => {
    if (user?.id && user.email)
      identify({
        id: user.id,
        email: user.email,
        name: user.name,
      });
  }, [user?.email, user?.id, user?.name]);

  return (
    <div className="flex relative w-full">
      {showNavigation && !!user ? <Sidebar /> : null}

      <div
        className={cn(
          "flex flex-col w-full overflow-x-hidden",
          fullScreenPage ? "h-screen overflow-hidden" : "min-h-screen",
          { "pb-[100px] md:pb-0": showNavigation && !!user }
        )}
      >
        <InvalidTimeDialog />

        <ConfirmationDialog
          open={tourDialogOpen && stepNumber !== studentTour.tour.steps.length}
          title={intl("stop-tour-dialog.title")}
          description={intl("stop-tour-dialog.description")}
          icon={<Exit />}
          actions={{
            primary: {
              label: intl("stop-tour-dialog.continue"),
              onClick: () => {
                setTourDialogOpen(false);
                studentTour.startFrom(stepNumber);
              },
            },
            secondary: {
              label: intl("labels.leave"),
              onClick: () => {
                setTourDialogOpen(false);
                studentTour.stop();
              },
            },
          }}
        />

        {showNavigation ? <Navbar /> : null}

        <Splash position="top">
          <Outlet />
        </Splash>

        <FloatingButtons />
      </div>
    </div>
  );
};

export default Root;
