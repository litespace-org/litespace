import React, { useEffect, useMemo } from "react";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { IUser } from "@litespace/types";
import { Route } from "@/lib/route";
import SidebarNav from "@/components/common/SideBar";
import {
  BarChart,
  FileText,
  Users,
  Video,
  Columns,
  BookOpen,
  Server,
  Settings,
  List,
  User,
} from "react-feather";
import cn from "classnames";
import { useAuthRoutes } from "@/hooks/authRoutes";
import { destructureRole } from "@litespace/sol/user";
import { useUser } from "@litespace/headless/user-ctx";

const Root: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useFormatMessage();

  useAuthRoutes();

  const role = useMemo(
    () => user?.role && destructureRole(user?.role),
    [user?.role]
  );

  const routes = useMemo(
    () =>
      [
        {
          label: intl("dashboard.sidebar.users"),
          route: Route.Users,
          icon: Users,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.invoices"),
          route: Route.Invoices,
          icon: FileText,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.media"),
          route: Route.Media,
          icon: Video,
          show: role?.admin || role?.mediaProvider,
        },
        {
          label: intl("dashboard.sidebar.plans"),
          route: Route.Plans,
          icon: BarChart,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.interviews"),
          route: Route.Interviews,
          icon: Columns,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.lessons"),
          route: Route.Lessons,
          icon: BookOpen,
          show: role?.admin,
        },
        {
          label: intl("dashboard.topics.title"),
          route: Route.Topics,
          icon: List,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.server.stats"),
          route: Route.ServerStats,
          icon: Server,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.platform.settings"),
          route: Route.PlatformSettings,
          icon: Settings,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.user.settings"),
          route: Route.UserSetting,
          icon: User,
          show: role?.admin || role?.mediaProvider,
        },
      ].filter((route) => route.show),
    [intl, role?.admin, role?.mediaProvider]
  );

  useEffect(() => {
    if (location.pathname === Route.Login) return;
    if (!user) return navigate(Route.Login);

    const forbidden =
      user.role === IUser.Role.Tutor ||
      user.role === IUser.Role.Student ||
      user.role === IUser.Role.Interviewer;

    if (forbidden) return window.location.replace("https://litespace.org");

    if (location.pathname !== Route.Root) return;

    if (
      user.role === IUser.Role.SuperAdmin ||
      user.role === IUser.Role.RegularAdmin
    )
      navigate(Route.Users);
    if (user.role === IUser.Role.MediaProvider) navigate(Route.Media);
  }, [location.pathname, navigate, user]);

  return (
    <main
      className={cn(
        "grid min-h-screen overflow-y-hidden text-foreground",
        user ? "grid-cols-[5%,95%]" : ""
      )}
    >
      <div className={cn(!user ? "hidden" : "")}>
        <SidebarNav options={routes} />
      </div>
      <Outlet />
    </main>
  );
};

export default Root;
