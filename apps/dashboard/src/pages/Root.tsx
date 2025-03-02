import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { IUser } from "@litespace/types";
import SidebarNav from "@/components/common/SideBarNav";
import cn from "classnames";
import { useAuthRoutes } from "@/hooks/authRoutes";
import { useUserContext } from "@litespace/headless/context/user";
import { Dashboard } from "@litespace/utils/routes";

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
      <main
        className={cn(
          "flex min-h-screen overflow-y-hidden text-foreground pr-[166px] md:pr-[98px] lg:pr-60",
          user ? "grid-cols-[5%,95%]" : ""
        )}
      >
        <div
          className={cn("fixed top-0 right-0 h-screen bg-brand-700 z-20", {
            hidden: !user,
          })}
        >
          <SidebarNav />
        </div>
        <Outlet />
      </main>
    </>
  );
};

export default Root;
