import React, { useEffect, useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
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
import { destructureRole } from "@litespace/utils/user";
import { useUserContext } from "@litespace/headless/context/user";

const Root: React.FC = () => {
  const { user } = useUserContext();
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
          show: role?.admin || role?.studio,
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
          show: role?.admin || role?.studio,
        },
      ].filter((route) => route.show),
    [intl, role?.admin, role?.studio]
  );

  useEffect(() => {
    if (location.pathname === Route.Login) return;
    if (!user) return navigate(Route.Login);

    const forbidden =
      user.role === IUser.Role.Tutor ||
      user.role === IUser.Role.Student ||
      user.role === IUser.Role.TutorManager;

    if (forbidden) return window.location.replace("https://litespace.org");

    if (location.pathname !== Route.Root) return;

    if (
      user.role === IUser.Role.SuperAdmin ||
      user.role === IUser.Role.RegularAdmin
    )
      navigate(Route.Users);
    if (user.role === IUser.Role.Studio) navigate(Route.Media);
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
