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

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelectors.full);
  const tutorMeta = useAppSelector(tutorMetaSelector);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggle, theme } = useTheme();

  useEffect(() => {
    const call = new UrlPattern(RoutePatterns.Call).match(location.pathname);
    const register = new UrlPattern(RoutePatterns.Register).match(
      location.pathname
    );

    if (!profile.value && !profile.loading && !register)
      return navigate(Route.Login);
    const user = profile.value?.user;

    if ([user?.email, user?.name].some((value) => value === null))
      return navigate(Route.Complete);

    if (
      !call &&
      !register &&
      user &&
      user.role === IUser.Role.Tutor &&
      tutorMeta &&
      (tutorMeta.bio === null ||
        tutorMeta.about === null ||
        user.image === null ||
        tutorMeta.video === null)
    )
      return navigate(Route.TutorOnboarding);
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
