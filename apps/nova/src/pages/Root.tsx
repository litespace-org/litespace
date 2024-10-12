import React, { useEffect, useMemo } from "react";
import { Toaster, useTheme } from "@litespace/luna";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import cn from "classnames";
import { useAppSelector } from "@/redux/store";
import { Route, RoutePatterns } from "@/types/routes";
import UrlPattern from "url-pattern";
import { tutorMetaSelector } from "@/redux/user/tutor";
import Navbar from "@/components/Layout/Navbar";
import { profileSelectors } from "@/redux/user/profile";
import { IUser } from "@litespace/types";
import { destructureRole } from "@litespace/sol";
// import { IUser } from "@litespace/types";

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelectors.full);
  const tutorMeta = useAppSelector(tutorMetaSelector);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggle, theme } = useTheme();

  useEffect(() => {
    const call = new UrlPattern(RoutePatterns.Call);
    const login = new UrlPattern(RoutePatterns.Login);
    const register = new UrlPattern(RoutePatterns.Register);
    const root = location.pathname === "/";
    const ignore = [call, login, register].some((patten) =>
      patten.match(location.pathname)
    );

    if (!profile.value && !profile.loading && !ignore)
      return navigate(Route.Login);
    const user = profile.value?.user;

    if ([user?.email, user?.name].some((value) => value === null))
      return navigate(Route.Complete);

    if (
      !ignore &&
      user &&
      user.role === IUser.Role.Tutor &&
      tutorMeta &&
      (tutorMeta.bio === null ||
        tutorMeta.about === null ||
        user.image === null ||
        tutorMeta.video === null)
    )
      return navigate(Route.TutorOnboarding);

    if (!profile.value || !root) return;
    const { tutor, student, interviewer } = destructureRole(
      profile.value.user.role
    );
    if (tutor || student) return navigate(Route.Lessons);
    if (interviewer) return navigate(Route.Interviews);
  }, [navigate, location.pathname, tutorMeta, profile.value, profile.loading]);

  const show = useMemo(() => {
    return location.pathname !== Route.Complete;
  }, [location.pathname]);

  return (
    <div className={cn("min-h-screen text-foreground flex flex-col")}>
      {show ? <Navbar toggleTheme={toggle} theme={theme} /> : null}
      <Outlet />
      <Toaster />
    </div>
  );
};

export default Root;
