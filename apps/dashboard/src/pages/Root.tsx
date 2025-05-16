import React, { useEffect } from "react";
import cn from "classnames";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { IUser } from "@litespace/types";
import { useUserContext } from "@litespace/headless/context/user";
import { Dashboard, Landing } from "@litespace/utils/routes";

import Sidebar from "@/components/Layout/Sidebar";
import { useAuthRoutes } from "@/hooks/authRoutes";
import { router } from "@/lib/route";
import { isRegularUser } from "@litespace/utils";
import Navbar from "@/components/Layout/Navbar";

const Root: React.FC = () => {
  const { user, logout } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();
  useAuthRoutes();

  useEffect(() => {
    if (location.pathname === Dashboard.Login) return;
    if (!user) return navigate(Dashboard.Login);

    if (location.pathname !== Dashboard.Root) return;

    if (
      user.role === IUser.Role.SuperAdmin ||
      user.role === IUser.Role.RegularAdmin
    )
      navigate(Dashboard.Users);
    if (user.role === IUser.Role.Studio) navigate(Dashboard.Media);

    // Handling users that not allowed to use the dashboard
    const regularUser = isRegularUser(user);

    if (user && regularUser) {
      logout();
      window.location.replace(
        router.landing({ route: Landing.Home, full: true })
      );
    }
  }, [location.pathname, logout, navigate, user]);

  return (
    <>
      <main
        className={cn(
          "flex flex-row items-stretch min-h-screen overflow-y-hidden bg-natural-50"
        )}
      >
        {user ? <Sidebar /> : null}
        <div className="flex-1 flex flex-col">
          <Navbar />
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default Root;
