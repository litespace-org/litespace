import React, { useEffect } from "react";
import { Toaster } from "@litespace/luna";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import cn from "classnames";
import { useAppSelector } from "@/redux/store";
import { Route, RoutePatterns } from "@/types/routes";
import UrlPattern from "url-pattern";
import { IUser } from "@litespace/types";
import { tutorMetaSelector } from "@/redux/user/tutor";

const Root: React.FC = () => {
  const me = useAppSelector((state) => state.user.me);
  const tutorMeta = useAppSelector(tutorMetaSelector);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const profile = me.value;
    const call = new UrlPattern(RoutePatterns.Call).match(location.pathname);

    if (!me.value && !me.loading) return navigate(Route.Login);

    if (
      [profile?.email, profile?.name.ar, profile?.name.en].some(
        (value) => value === null
      )
    )
      return navigate(Route.Complete);

    if (
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
  }, [navigate, location.pathname, tutorMeta, me]);

  return (
    <div
      className={cn(
        "min-h-screen max-w-screen-xl mx-auto text-foreground flex flex-row"
      )}
    >
      <Outlet />
      <Toaster />
    </div>
  );
};

export default Root;
