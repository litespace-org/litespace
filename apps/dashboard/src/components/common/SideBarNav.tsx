import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import cn from "classnames";

import { resetUserProfile } from "@/redux/user/profile";
import { useAppDispatch } from "@/redux/store";

import { useUserContext } from "@litespace/headless/context/user";
import { destructureRole } from "@litespace/utils";
import { Dashboard } from "@litespace/utils/routes";

import { removeAuthToken } from "@litespace/ui/cache";
import { LinkInfo, Sidebar } from "@litespace/ui/Sidebar";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

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
  LogOut,
} from "react-feather";
import { Typography } from "@litespace/ui/Typography";

const SidebarNav = () => {
  const intl = useFormatMessage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useUserContext();

  const role = useMemo(
    () => user?.role && destructureRole(user?.role),
    [user?.role]
  );

  const logout = useCallback(() => {
    removeAuthToken();
    dispatch(resetUserProfile());
    navigate(Dashboard.Login);
  }, [dispatch, navigate]);

  const links: Record<string, LinkInfo[]> = useMemo(
    () => ({
      [intl("sidebar.main")]: [
        {
          label: intl("dashboard.sidebar.users"),
          route: Dashboard.Users,
          Icon: Users,
          isActive: true,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.invoices"),
          route: Dashboard.Invoices,
          Icon: FileText,
          isActive: false,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.media"),
          route: Dashboard.Media,
          Icon: Video,
          isActive: false,
          show: role?.admin || role?.studio,
        },
        {
          label: intl("dashboard.sidebar.plans"),
          route: Dashboard.Plans,
          Icon: BarChart,
          isActive: false,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.interviews"),
          route: Dashboard.Interviews,
          Icon: Columns,
          isActive: false,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.lessons"),
          route: Dashboard.Lessons,
          Icon: BookOpen,
          isActive: false,
          show: role?.admin,
        },
        {
          label: intl("dashboard.topics.title"),
          route: Dashboard.Topics,
          Icon: List,
          isActive: false,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.server.stats"),
          route: Dashboard.ServerStats,
          Icon: Server,
          isActive: false,
          show: role?.admin,
        },
      ].filter((route) => route.show),

      [intl("sidebar.settings")]: [
        {
          label: intl("dashboard.sidebar.platform.settings"),
          route: Dashboard.PlatformSettings,
          Icon: Settings,
          isActive: false,
          show: role?.admin,
        },
        {
          label: intl("dashboard.sidebar.user.settings"),
          route: Dashboard.UserSetting,
          Icon: User,
          isActive: false,
          show: role?.admin || role?.studio,
          tail: (
            <button
              onClick={logout}
              className={cn(
                "flex flex-row justify-start md:justify-center lg:justify-start",
                "gap-2 md:gap-0 lg:gap-4 px-[14px] py-2 rounded-lg",
                "hover:text-destructive-400 hover:bg-destructive-100",
                "active:bg-destructive-400 [&_*]:active:text-natural-50",
                "[&_*]:active:stroke-natural-50 transition-all duration-200"
              )}
            >
              <LogOut className="h-4 w-4 md:h-6 md:w-6 stroke-destructive-400" />
              <Typography
                tag="span"
                className={cn(
                  "text-destructive-400 active:bg-destructive-400 active:text-natural-50 text-tiny lg:text-caption",
                  "flex md:hidden lg:flex"
                )}
              >
                {intl("sidebar.logout")}
              </Typography>
            </button>
          ),
        },
      ].filter((route) => route.show),
    }),
    [intl, role?.admin, role?.studio, logout]
  );

  return (
    <Sidebar
      className="h-full top-0 overflow-auto"
      hide={() => {}}
      links={links}
    />
  );
};

export default SidebarNav;
