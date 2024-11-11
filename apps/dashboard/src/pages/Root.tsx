import React, { useEffect, useMemo } from "react";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
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
} from "react-feather";
import cn from "classnames";
import { useAuthRoutes } from "@/hooks/authRoutes";
import { destructureRole } from "@litespace/sol/user";

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useFormatMessage();

  useAuthRoutes();

  const role = useMemo(
    () => profile?.role && destructureRole(profile?.role),
    [profile?.role]
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
          label: intl("dashboard.sidebar.settings"),
          route: Route.Settings,
          icon: Settings,
          show: role?.admin,
        },
      ].filter((route) => route.show),
    [intl, role?.admin, role?.mediaProvider]
  );

  useEffect(() => {
    if (location.pathname === Route.Login) return;
    if (!profile) return navigate(Route.Login);

    const forbidden =
      profile.role === IUser.Role.Tutor ||
      profile.role === IUser.Role.Student ||
      profile.role === IUser.Role.Interviewer;

    if (forbidden) return window.location.replace("https://litespace.org");

    if (location.pathname !== Route.Root) return;

    if (
      profile.role === IUser.Role.SuperAdmin ||
      profile.role === IUser.Role.RegularAdmin
    )
      navigate(Route.Users);
    if (profile.role === IUser.Role.MediaProvider) navigate(Route.Media);
  }, [location.pathname, navigate, profile]);

  return (
    <main
      className={cn(
        "grid min-h-screen overflow-y-hidden text-foreground",
        profile ? "grid-cols-[5%,95%]" : ""
      )}
    >
      <div className={cn(!profile ? "hidden" : "")}>
        <SidebarNav options={routes} />
      </div>
      <Outlet />
    </main>
  );
};

export default Root;
