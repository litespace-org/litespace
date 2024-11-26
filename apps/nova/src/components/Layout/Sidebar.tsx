import { useAppDispatch } from "@/redux/store";
import { resetUserProfile } from "@/redux/user/profile";
import { resetTutorMeta } from "@/redux/user/tutor";
import { Route } from "@/types/routes";
import { removeAuthToken } from "@litespace/luna/cache";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import Calendar from "@litespace/assets/Calendar";
import Chat from "@litespace/assets/Chat";
import Home from "@litespace/assets/Home";
import Logo from "@litespace/assets/Logo";
import Logout from "@litespace/assets/Logout";
import People from "@litespace/assets/People";
import Settings from "@litespace/assets/Settings";
import Tag from "@litespace/assets/Tag";
import Video from "@litespace/assets/Video";
import cn from "classnames";
import React, { SVGProps, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

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
        "flex flex-row gap-4 px-[14px] py-2 items-center",
        "rounded-lg transition-colors duration-200 group",
        active ? "bg-brand-700" : "bg-transparent hover:bg-natural-400"
      )}
      to={to}
    >
      <Icon
        className={cn(
          "[&_*]:transition-all [&_*]:duration-200  group-hover:[&_*]:stroke-natural-50",
          active ? "[&_*]:stroke-natural-50" : "[&_*]:stroke-natural-700"
        )}
      />
      <Typography
        element="caption"
        weight="semibold"
        className={cn(
          active
            ? "text-natural-50"
            : "text-natural-700 group-hover:text-natural-50"
        )}
      >
        {label}
      </Typography>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const intl = useFormatMessage();
  const location = useLocation();

  const logout = useCallback(() => {
    removeAuthToken();
    dispatch(resetUserProfile());
    dispatch(resetTutorMeta());
  }, [dispatch]);

  const mainPages = useMemo(() => {
    return [
      {
        label: intl("sidebar.dashboard"),
        route: Route.Root,
        Icon: Home,
      },
      {
        label: intl("sidebar.upcoming-lessons"),
        route: Route.UpcomingLessons,
        Icon: Video,
      },
      {
        label: intl("sidebar.tutors"),
        route: Route.Tutors,
        Icon: People,
      },
      {
        label: intl("sidebar.schedule"),
        route: Route.Schedule,
        Icon: Calendar,
      },
      {
        label: intl("sidebar.lessons"),
        route: Route.Lessons,
        Icon: Calendar,
      },
      {
        label: intl("sidebar.chat"),
        route: Route.Chat,
        Icon: Chat,
      },
      {
        label: intl("sidebar.subscriptions"),
        route: Route.Subscription,
        Icon: Tag,
      },
    ];
  }, [intl]);

  return (
    <div
      className={cn(
        "fixed top-0 bottom-0 start-0 flex flex-col gap-10 w-60 p-6 shadow-sidebar"
      )}
    >
      <Link to={Route.Root} className="flex items-center gap-2">
        <Logo className="h-[50px]" />
        <Typography
          element="subtitle-2"
          weight="bold"
          className="text-brand-500"
        >
          {intl("labels.litespace")}
        </Typography>
      </Link>

      <div className="flex flex-col gap-1.5">
        <Typography
          element="caption"
          weight="bold"
          className="text-natural-800 py-2"
        >
          {intl("sidebar.main")}
        </Typography>
        <ul className="flex flex-col gap-2">
          {mainPages.map(({ label, route, Icon }) => (
            <SidebarItem
              key={label}
              to={route}
              Icon={Icon}
              label={label}
              active={location.pathname === route}
            />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5">
        <Typography className="text-natural-800 py-2" weight="bold">
          {intl("sidebar.settings")}
        </Typography>
        <ul className="flex flex-col gap-2">
          <SidebarItem
            to={Route.Settings}
            Icon={Settings}
            label={intl("sidebar.settings")}
            active={location.pathname === Route.Settings}
          />
          <button
            onClick={logout}
            className={cn(
              "flex gap-4 px-[14px] py-2 rounded-lg",
              "hover:text-destructive-400 hover:bg-destructive-100",
              "active:bg-destructive-400 [&_*]:active:text-natural-50",
              "[&_*]:active:stroke-natural-50 transition-all duration-200"
            )}
          >
            <Logout />
            <Typography className="text-destructive-400 active:bg-destructive-400 active:text-natural-50">
              {intl("sidebar.logout")}
            </Typography>
          </button>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
