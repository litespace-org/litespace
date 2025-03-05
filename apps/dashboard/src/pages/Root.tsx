import React, { useEffect } from "react";
import cn from "classnames";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";
import { Dashboard } from "@litespace/utils/routes";

import Sidebar from "@/components/Layout/Sidebar";
import { useAuthRoutes } from "@/hooks/authRoutes";

const Root: React.FC = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  useAuthRoutes();

  useEffect(() => {
    if (location.pathname === Dashboard.Login) return;
    if (!user) return navigate(Dashboard.Login);

    const forbidden =
      user.role === IUser.Role.Tutor ||
      user.role === IUser.Role.Student ||
      user.role === IUser.Role.TutorManager;

    if (forbidden) return window.location.replace("https://litespace.org");

    if (location.pathname !== Dashboard.Root) return;

    if (
      user.role === IUser.Role.SuperAdmin ||
      user.role === IUser.Role.RegularAdmin
    )
      navigate(Dashboard.Users);
    if (user.role === IUser.Role.Studio) navigate(Dashboard.Media);
  }, [location.pathname, navigate, user]);

  return (
    <>
      <main className={cn("flex min-h-screen overflow-y-hidden bg-natural-50")}>
        {user ? <Sidebar /> : null}
        <Outlet />
      </main>
    </>
  );
};

export default Root;
