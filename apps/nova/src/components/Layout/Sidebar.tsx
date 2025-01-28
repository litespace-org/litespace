import { Route } from "@/types/routes";
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
import ScheduleManagement from "@litespace/assets/ScheduleManagement";
import ProfileAvatar from "@litespace/assets/ProfileAvatar";
import cn from "classnames";
import React, { SVGProps, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import { IUser } from "@litespace/types";

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
        element="caption"
        weight="semibold"
        className={cn(active ? "text-natural-50" : "text-natural-700")}
      >
        {label}
      </Typography>
    </Link>
  );
};

const Sidebar = () => {
  const intl = useFormatMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserContext();

  const mainPages = useMemo(() => {
    const dashboard = {
      label: intl("sidebar.dashboard"),
      route:
        user?.role === IUser.Role.Student
          ? Route.StudentDashboard
          : Route.TutorDashboard,
      Icon: Home,
    };

    const lessonsSchedule = {
      label: intl("sidebar.lessons-schedule"),
      route: Route.LessonsSchedule,
      Icon: Calendar,
    };

    const upcomingLessons = {
      label: intl("sidebar.upcoming-lessons"),
      route: Route.UpcomingLessons,
      Icon: Video,
    };

    const chat = {
      label: intl("sidebar.chat"),
      route: Route.Chat,
      Icon: Chat,
    };

    const scheduleManagement = {
      label: intl("sidebar.schedule-management"),
      route: Route.ScheduleManagement,
      Icon: ScheduleManagement,
    };

    const tutors = {
      label: intl("sidebar.tutors"),
      route: Route.Tutors,
      Icon: People,
    };

    const subscribtions = {
      label: intl("sidebar.subscriptions"),
      route: Route.Subscription,
      Icon: Tag,
    };

    if (
      user?.role === IUser.Role.Tutor ||
      user?.role === IUser.Role.TutorManager
    )
      return [
        dashboard,
        upcomingLessons,
        lessonsSchedule,
        scheduleManagement,
        chat,
      ];

    if (user?.role === IUser.Role.Student)
      return [
        dashboard,
        upcomingLessons,
        tutors,
        lessonsSchedule,
        chat,
        subscribtions,
      ];

    return [];
  }, [intl, user?.role]);

  return (
    // TODO: slide the sidebar to the right instead of hiding it.
    <div className="hidden sm:flex fixed top-0 bottom-0 start-0 flex-col gap-10 w-60 p-6 shadow-app-sidebar z-sidebar">
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
          {user ? (
            <SidebarItem
              to={
                user?.role === IUser.Role.Student
                  ? Route.StudentSettings
                  : Route.TutorSettings
              }
              Icon={
                user?.role === IUser.Role.Student ? Settings : ProfileAvatar
              }
              label={
                user?.role === IUser.Role.Student
                  ? intl("sidebar.settings")
                  : intl("sidebar.profile")
              }
              active={
                location.pathname === Route.TutorSettings ||
                location.pathname === Route.StudentSettings
              }
            />
          ) : null}

          <button
            onClick={() => {
              navigate(Route.Login);
              logout();
            }}
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
