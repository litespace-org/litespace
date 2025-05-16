import React, { SVGProps, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import cn from "classnames";

import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import { IUser } from "@litespace/types";
import { Dashboard } from "@litespace/utils/routes";
import { useUserContext } from "@litespace/headless/context/user";

import Logo from "@litespace/assets/Logo";
import Logout from "@litespace/assets/Logout";
import People from "@litespace/assets/People";
import Settings from "@litespace/assets/Settings";
import Settings2 from "@litespace/assets/Settings2";
import Tag from "@litespace/assets/Tag";
import Receipt from "@litespace/assets/Receipt";
import Users from "@litespace/assets/Users";
import Video from "@litespace/assets/Video";
import Book from "@litespace/assets/Book";
import Rate from "@litespace/assets/Rate";

import { router } from "@/lib/route";
import { Icon } from "@/types/common";

const SidebarItem = ({
  to,
  Icon,
  label,
  active,
}: {
  to: string;
  Icon: React.MemoExoticComponent<
    (props: SVGProps<SVGSVGElement>) => JSX.Element
  >;
  label: React.ReactNode;
  active?: boolean;
}) => {
  return (
    <Link
      className={cn(
        "flex flex-row justify-center lg:justify-start gap-2 lg:gap-4 px-[14px] py-2 items-center ",
        "rounded-lg transition-colors duration-200 group",
        {
          "bg-brand-700": active,
          "bg-transparent hover:bg-natural-100": !active,
        }
      )}
      to={to}
    >
      <Icon
        className={cn("[&_*]:transition-all [&_*]:duration-200 h-6 w-6", {
          "[&_*]:stroke-natural-50": active,
          "[&_*]:stroke-natural-700": !active,
        })}
      />
      <Typography
        tag="span"
        className={cn(
          active ? "text-natural-50" : "text-natural-700",
          "text-tiny lg:text-caption font-normal lg:font-semibold",
          "hidden lg:flex"
        )}
      >
        {label}
      </Typography>
    </Link>
  );
};

type LinkInfo = {
  label: string;
  route: Dashboard;
  Icon: Icon;
  isActive: boolean;
};

const Sidebar: React.FC = () => {
  const intl = useFormatMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserContext();

  const mainPages: LinkInfo[] = useMemo(() => {
    const match = (route: Dashboard) =>
      router.isMatch.dashboard(route, location.pathname);

    const photoSession: LinkInfo = {
      label: intl("dashboard.sidebar.photo-sessions"),
      route: Dashboard.PhotoSessions,
      Icon: Video,
      isActive: match(Dashboard.PhotoSessions),
    };

    const users: LinkInfo = {
      label: intl("dashboard.sidebar.users"),
      route: Dashboard.Users,
      isActive: match(Dashboard.Users),
      Icon: People,
    };

    const invoices: LinkInfo = {
      label: intl("dashboard.sidebar.invoices"),
      route: Dashboard.Invoices,
      isActive: match(Dashboard.Invoices),
      Icon: Receipt,
    };

    const plans: LinkInfo = {
      label: intl("dashboard.sidebar.plans"),
      route: Dashboard.Plans,
      isActive: match(Dashboard.Plans),
      Icon: Tag,
    };

    const interviews: LinkInfo = {
      label: intl("dashboard.sidebar.interviews"),
      route: Dashboard.Interviews,
      isActive: match(Dashboard.Interviews),
      Icon: Users,
    };

    const lessons: LinkInfo = {
      label: intl("dashboard.sidebar.lessons"),
      route: Dashboard.Lessons,
      isActive: match(Dashboard.Lessons),
      Icon: Book,
    };

    const topics: LinkInfo = {
      label: intl("dashboard.topics.title"),
      route: Dashboard.Topics,
      isActive: match(Dashboard.Topics),
      Icon: Rate,
    };

    const tutors: LinkInfo = {
      label: intl("dashboard.tutors.title"),
      route: Dashboard.Tutors,
      isActive: match(Dashboard.Tutors),
      Icon: People,
    };

    if (user?.role === IUser.Role.Studio) return [photoSession];

    return [
      users,
      invoices,
      plans,
      topics,
      interviews,
      photoSession,
      lessons,
      tutors,
    ];
  }, [intl, location.pathname, user?.role]);

  return (
    <div
      className={cn(
        "flex flex-col gap-10 relative z-sidebar",
        "bg-natural-50 w-[98px] lg:w-60 p-4 lg:p-6 shadow-app-sidebar"
      )}
    >
      <Link
        to={Dashboard.Root}
        className="flex justify-center lg:justify-start items-center gap-2"
      >
        <Logo className="h-10 w-10 my-[5px] lg:my-0" />
        <Typography
          tag="h1"
          className="hidden lg:flex text-brand-500 text-tiny lg:text-subtitle-2 font-bold"
        >
          {intl("labels.litespace")}
        </Typography>
      </Link>

      <div className="flex flex-col gap-1.5">
        <Typography
          tag="span"
          className="text-natural-800 py-2 text-caption font-bold text-center lg:text-start"
        >
          {intl("sidebar.main")}
        </Typography>
        <ul className="flex flex-col gap-2">
          {mainPages.map(({ label, route, Icon, isActive }) => (
            <SidebarItem
              key={label}
              to={route}
              Icon={Icon}
              label={label}
              active={isActive}
            />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5">
        <Typography
          tag="span"
          className="text-natural-800 py-2 text-tiny lg:text-caption font-bold text-center lg:text-start"
        >
          {intl("sidebar.settings")}
        </Typography>
        <ul className="flex flex-col gap-1.5">
          {user ? (
            <SidebarItem
              to={Dashboard.UserSetting}
              Icon={Settings}
              label={intl("dashboard.sidebar.user-settings")}
              active={location.pathname === Dashboard.UserSetting}
            />
          ) : null}

          {user?.role === IUser.Role.SuperAdmin ||
          user?.role === IUser.Role.RegularAdmin ? (
            <SidebarItem
              to={Dashboard.PlatformSettings}
              Icon={Settings2}
              label={intl("dashboard.sidebar.platform-settings")}
              active={location.pathname === Dashboard.PlatformSettings}
            />
          ) : null}

          <button
            onClick={() => {
              navigate(Dashboard.Login);
              logout();
            }}
            className={cn(
              "flex flex-row justify-center lg:justify-start gap-0 lg:gap-4 px-[14px] py-2 rounded-lg",
              "hover:text-destructive-400 hover:bg-destructive-100",
              "active:bg-destructive-400 [&_*]:active:text-natural-50",
              "[&_*]:active:stroke-natural-50 transition-all duration-200"
            )}
          >
            <Logout className="h-6 w-6" />
            <Typography
              tag="span"
              className="hidden lg:flex text-destructive-400 active:bg-destructive-400 active:text-natural-50 text-tiny lg:text-caption"
            >
              {intl("sidebar.logout")}
            </Typography>
          </button>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
