import Calendar from "@litespace/assets/Calendar";
import Chat from "@litespace/assets/Chat";
import Home from "@litespace/assets/Home";
import Logo from "@litespace/assets/Logo";
import Logout from "@litespace/assets/Logout";
import People from "@litespace/assets/People";
import ProfileAvatar from "@litespace/assets/ProfileAvatar";
import ScheduleManagement from "@litespace/assets/ScheduleManagement";
import Settings from "@litespace/assets/Settings";
import Tag from "@litespace/assets/Tag";
import Video from "@litespace/assets/Video";
import AccountPromotion from "@litespace/assets/AccountPromotion";
import TrendUp from "@litespace/assets/TrendUp";
import { useUserContext } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IUser, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import React, { SVGProps, useCallback, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MOBILE_NAVBAR_HEIGHT,
  MOBILE_SIDEBAR_WIDTH,
  TABLET_NAVBAR_HEIGHT,
} from "@/constants/ui";
import { Icon } from "@/types/common";
import { Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";

const SidebarItem = ({
  to,
  hide,
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
  hide: Void;
}) => {
  const { md, lg } = useMediaQuery();

  return (
    <Link
      className={cn(
        "flex flex-row justify-start md:justify-center lg:justify-start gap-2 lg:gap-4 px-[14px] py-2 items-center ",
        "rounded-lg transition-colors duration-200 group",
        {
          "bg-brand-700": active,
          "bg-transparent hover:bg-natural-100": !active,
        }
      )}
      to={to}
      onClick={hide}
    >
      <Icon
        className={cn(
          "[&_*]:transition-all [&_*]:duration-200 h-4 w-4 md:h-6 md:w-6",
          {
            "[&_*]:stroke-natural-50": active,
            "[&_*]:stroke-natural-700": !active,
          }
        )}
      />
      {lg || !md ? (
        <Typography
          tag="span"
          className={cn(
            active ? "text-natural-50" : "text-natural-700",
            "text-tiny lg:text-caption font-normal lg:font-semibold"
          )}
        >
          {label}
        </Typography>
      ) : null}
    </Link>
  );
};

type LinkInfo = {
  label: string;
  route: Web;
  Icon: Icon;
  isActive: boolean;
};

const Sidebar: React.FC<{
  hide: Void;
}> = ({ hide }) => {
  const { md, lg } = useMediaQuery();
  const intl = useFormatMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserContext();

  const mainPages: LinkInfo[] = useMemo(() => {
    const match = (route: Web) => router.isMatch.web(route, location.pathname);
    const dashboard: LinkInfo = {
      label: intl("sidebar.dashboard"),
      route:
        user?.role === IUser.Role.Student
          ? Web.StudentDashboard
          : Web.TutorDashboard,
      Icon: Home,
      isActive: match(Web.StudentDashboard) || match(Web.TutorDashboard),
    };

    const lessonsSchedule = {
      label: intl("sidebar.lessons-schedule"),
      route: Web.LessonsSchedule,
      Icon: Calendar,
      isActive: match(Web.LessonsSchedule),
    };

    const upcomingLessons = {
      label: intl("sidebar.upcoming-lessons"),
      route: Web.UpcomingLessons,
      Icon: Video,
      isActive: match(Web.UpcomingLessons),
    };

    const chat = {
      label: intl("sidebar.chat"),
      route: Web.Chat,
      Icon: Chat,
      isActive: match(Web.Chat),
    };

    const scheduleManagement = {
      label: intl("sidebar.schedule-management"),
      route: Web.ScheduleManagement,
      Icon: ScheduleManagement,
      isActive: match(Web.ScheduleManagement),
    };

    const tutors = {
      label: intl("sidebar.tutors"),
      route: Web.Tutors,
      Icon: People,
      isActive: match(Web.Tutors) || match(Web.TutorProfile),
    };

    const subscribtions = {
      label: intl("sidebar.subscriptions"),
      route: Web.Subscription,
      Icon: Tag,
      isActive: match(Web.Subscription),
    };

    const invoices = {
      label: intl("sidebar.invoices"),
      route: Web.Invoices,
      Icon: TrendUp,
      isActive: match(Web.Invoices),
    };

    if (user?.role === IUser.Role.Tutor)
      return [
        dashboard,
        upcomingLessons,
        lessonsSchedule,
        scheduleManagement,
        chat,
        invoices,
      ];

    if (user?.role === IUser.Role.TutorManager)
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
  }, [intl, location.pathname, user?.role]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      const backdropXEnd = window.innerWidth - MOBILE_SIDEBAR_WIDTH;
      const backdropYStart = !md ? MOBILE_NAVBAR_HEIGHT : TABLET_NAVBAR_HEIGHT;
      if (e.pageX < backdropXEnd && e.pageY > backdropYStart) hide();
    },
    [hide, md]
  );

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [onMouseDown]);

  return (
    <div
      className={cn(
        "absolute md:static top-[72px] md:top-0 bottom-0 start-0 z-20 md:z-10 lg:z-sidebar",
        "bg-natural-50 w-[166px] md:w-[98px] lg:w-60 p-4 lg:p-6 shadow-app-sidebar",
        "flex flex-col gap-6 md:gap-10"
      )}
    >
      <Link
        to={Web.Root}
        className="flex justify-start md:justify-center lg:justify-start items-center gap-1 md:gap-2"
      >
        <Logo className="h-6 md:h-10 md:w-10 md:my-[5px] lg:my-0" />
        {lg || !md ? (
          <Typography
            tag="h1"
            className="inline-block text-brand-500 text-tiny lg:text-subtitle-2 font-bold"
          >
            {intl("labels.litespace")}
          </Typography>
        ) : null}
      </Link>

      <div className="flex flex-col gap-2 md:gap-1.5">
        <Typography
          tag="span"
          className="text-natural-800 md:py-2 text-tiny md:text-caption font-bold md:text-center lg:text-start"
        >
          {intl("sidebar.main")}
        </Typography>
        <ul className="flex flex-col gap-2">
          {mainPages.map(({ label, route, Icon, isActive }) => (
            <SidebarItem
              hide={hide}
              key={label}
              to={route}
              Icon={Icon}
              label={label}
              active={isActive}
            />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 md:gap-1.5">
        <Typography
          tag="span"
          className="text-natural-800 md:py-2 text-tiny lg:text-caption font-bold text-start md:text-center lg:text-start"
        >
          {intl("sidebar.settings")}
        </Typography>
        <ul className="flex flex-col gap-1.5">
          {user ? (
            <SidebarItem
              to={
                user?.role === IUser.Role.Student
                  ? Web.StudentSettings
                  : Web.TutorSettings
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
                location.pathname === Web.TutorSettings ||
                location.pathname === Web.StudentSettings
              }
              hide={hide}
            />
          ) : null}

          <button
            onClick={() => {
              navigate(Web.Login);
              logout();
              hide();
            }}
            className={cn(
              "flex flex-row justify-start md:justify-center lg:justify-start gap-2 md:gap-0 lg:gap-4 px-[14px] py-2 rounded-lg",
              "hover:text-destructive-400 hover:bg-destructive-100",
              "active:bg-destructive-400 [&_*]:active:text-natural-50",
              "[&_*]:active:stroke-natural-50 transition-all duration-200"
            )}
          >
            <Logout className="h-4 w-4 md:h-6 md:w-6" />
            {lg || !md ? (
              <Typography
                tag="span"
                className="text-destructive-400 active:bg-destructive-400 active:text-natural-50 text-tiny lg:text-caption"
              >
                {intl("sidebar.logout")}
              </Typography>
            ) : null}
          </button>
        </ul>
      </div>

      {user &&
      user.role === IUser.Role.Student &&
      location.pathname !== Web.Subscription &&
      (lg || !md) ? (
        <div className="bg-brand-100 lg:rounded-lg mt-10 -mx-4 lg:mx-0 py-4 lg:pb-0 flex flex-col items-center">
          <div className="mx-2 lg:mx-0 px-4 mb-3">
            <Typography
              tag="p"
              className="text-natural-950 inline-block text-tiny lg:text-caption font-bold lg:font-semibold"
            >
              {intl("sidebar.account-promotion.title")}
            </Typography>
            <Typography
              tag="p"
              className="text-natural-700 inline-block text-tiny lg:text-caption font-normal lg:font-medium"
            >
              {intl("sidebar.account-promotion.description")}
            </Typography>
          </div>
          <Link to={Web.Subscription}>
            <Button size={"small"} htmlType="button">
              <Typography
                tag="span"
                className="text-natural-50 text-caption font-semibold"
              >
                {intl("navbar.subscribe-now")}
              </Typography>
            </Button>
          </Link>

          {lg ? (
            <div className="h-[101px] w-[192px] mt-6">
              <AccountPromotion />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Sidebar;
