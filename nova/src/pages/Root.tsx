import React, { useEffect } from "react";
import { Toaster } from "@litespace/luna";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import cn from "classnames";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { Route, RoutePatterns } from "@/types/routes";
import UrlPattern from "url-pattern";
import { IUser } from "@litespace/types";
import { tutorMetaSelector } from "@/redux/user/tutor";

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const tutorMeta = useAppSelector(tutorMetaSelector);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!profile) return;

    const register = new UrlPattern(RoutePatterns.Register).match(
      location.pathname
    );
    const login = new UrlPattern(RoutePatterns.Login).match(location.pathname);
    const call = new UrlPattern(RoutePatterns.Call).match(location.pathname);
    const ignore = register || login;

    if (
      [profile.email, profile.name.ar, profile.name.en].some(
        (value) => value === null
      ) &&
      !ignore
    )
      return navigate(Route.Complete);

    if (
      !ignore &&
      !call &&
      profile &&
      profile.role === IUser.Role.Tutor &&
      tutorMeta &&
      (tutorMeta.bio === null ||
        tutorMeta.about === null ||
        profile.photo === null ||
        tutorMeta.video === null)
    )
      return navigate(Route.TutorOnboarding);
  }, [navigate, profile, location.pathname, tutorMeta]);

  return (
    <div className={cn("min-h-screen text-foreground flex flex-col")}>
      <Toaster />
      <Outlet />
    </div>
  );
};

export default Root;
