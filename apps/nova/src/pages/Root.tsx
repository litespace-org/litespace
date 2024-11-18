import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { Route, RoutePatterns } from "@/types/routes";
import { tutorMetaSelector } from "@/redux/user/tutor";
import { profileSelectors } from "@/redux/user/profile";
import { destructureRole } from "@litespace/sol/user";
import { IUser } from "@litespace/types";
import UrlPattern from "url-pattern";
import cn from "classnames";
import Sidebar from "@/components/Layout/Sidebar";
import Navbar from "@/components/Layout/Navbar";

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelectors.full);
  const tutorMeta = useAppSelector(tutorMetaSelector);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const call = new UrlPattern(RoutePatterns.Call);
    const login = new UrlPattern(RoutePatterns.Login);
    const register = new UrlPattern(RoutePatterns.Register);
    const resetPassword = new UrlPattern(RoutePatterns.ResetPassword);
    const verifyEmail = new UrlPattern(RoutePatterns.VerifyEmail);
    const root = location.pathname === "/";
    const complete = location.pathname === Route.Complete;
    const ignore = [call, login, register, resetPassword, verifyEmail].some(
      (patten) => patten.match(location.pathname)
    );

    if (!profile.value && !profile.loading && !ignore)
      return navigate(Route.Login);
    const user = profile.value?.user;

    // redirect the user to complete his profile
    // redirect student in case of missing: name, age
    // redirect tutor in case of missing: name, age, gender
    const redirectStudent =
      user &&
      user.role === IUser.Role.Student &&
      [user.name, user.birthYear].some((value) => value === null);
    const redirectTutor =
      user &&
      user.role === IUser.Role.Tutor &&
      [user.name, user.birthYear, user.gender].some((value) => value === null);
    if (redirectStudent || redirectTutor) return navigate(Route.Complete);

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

    if (!profile.value || (!root && !complete)) return;
    const { tutor, student, interviewer } = destructureRole(
      profile.value.user.role
    );
    if (tutor || student) return navigate(Route.Lessons);
    if (interviewer) return navigate(Route.Interviews);
  }, [navigate, location.pathname, tutorMeta, profile.value, profile.loading]);

  return (
    <div className="flex relative w-full bg-natural-50 dark:bg-secondary-950">
      <Sidebar />
      <div
        className={cn(
          "min-h-screen ps-[240px] text-foreground flex flex-col gap-8 overflow-x-hidden"
        )}
      >
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
