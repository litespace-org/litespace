import React, { useEffect, useMemo } from "react";
import cn from "classnames";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { IUser } from "@litespace/types";
import { useUser } from "@litespace/headless/context/user";
import { Dashboard, Landing } from "@litespace/utils/routes";

import Sidebar from "@/components/Layout/Sidebar";
import { useAuthRoutes } from "@/hooks/authRoutes";
import { router } from "@/lib/route";
import { isRegularUser } from "@litespace/utils";
import Navbar from "@/components/Layout/Navbar";

const Root: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  useAuthRoutes();

  const isPublicPath = useMemo(() => {
    const publicUrls: string[] = [Dashboard.Login];
    return publicUrls.includes(location.pathname);
  }, [location.pathname]);

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
    <div
      className={cn(
        "flex flex-row items-stretch min-h-screen overflow-x-hidden bg-natural-50"
      )}
    >
      {user && !isPublicPath ? <Sidebar /> : null}

      <div className="flex-1 flex flex-col overflow-y-hidden">
        {user && !isPublicPath ? (
          <Navbar
            id={user.id}
            name={user.name}
            email={user.email}
            image={user.image}
          />
        ) : null}

        <Outlet />
      </div>
    </div>
  );
};

export default Root;
