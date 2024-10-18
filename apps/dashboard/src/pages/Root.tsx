import React, { useEffect } from "react";
import { Toaster } from "@litespace/luna";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { IUser } from "@litespace/types";
import { Route } from "@/lib/route";

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) return;
    if (
      profile.role === IUser.Role.SuperAdmin ||
      profile.role === IUser.Role.RegularAdmin
    )
      navigate(Route.Users);
    if (profile.role === IUser.Role.MediaProvider) navigate(Route.Media);
  }, [navigate, profile]);

  return (
    <main className="min-h-screen text-foreground flex overflow-y-hidden">
      <Outlet />
      <Toaster />
    </main>
  );
};

export default Root;
