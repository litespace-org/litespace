import React, { useEffect } from "react";
import { Toaster } from "@litespace/luna";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { IUser } from "@litespace/types";
import { Route } from "@/lib/route";

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!profile || location.pathname !== Route.Root) return;
    if (
      profile.role === IUser.Role.SuperAdmin ||
      profile.role === IUser.Role.RegularAdmin
    )
      navigate(Route.Users);
    if (profile.role === IUser.Role.MediaProvider) navigate(Route.Media);
  }, [location.pathname, navigate, profile]);

  return (
    <main className="min-h-screen text-foreground flex overflow-y-hidden">
      <Outlet />
      <Toaster />
    </main>
  );
};

export default Root;
