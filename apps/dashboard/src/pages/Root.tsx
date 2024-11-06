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
} from "react-feather";
import cn from "classnames";

const Root: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);
  const navigate = useNavigate();
  const location = useLocation();
  const intl = useFormatMessage();
  const routes = useMemo(
    () => [
      {
        label: intl("dashboard.navbar.users"),
        route: Route.Users,
        icon: Users,
      },
      {
        label: intl("dashboard.navbar.invoices"),
        route: Route.Invoices,
        icon: FileText,
      },
      {
        label: intl("dashboard.navbar.media"),
        route: Route.Media,
        icon: Video,
      },
      {
        label: intl("dashboard.navbar.plans"),
        route: Route.Plans,
        icon: BarChart,
      },
      {
        label: intl("dashboard.navbar.interviews"),
        route: Route.Interviews,
        icon: Columns,
      },
      {
        label: intl("dashboard.navbar.lessons"),
        route: Route.Lessons,
        icon: BookOpen,
      },
    ],
    [intl]
  );

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
