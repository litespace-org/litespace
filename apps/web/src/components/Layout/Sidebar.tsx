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
        "flex flex-row gap-2 md:gap-4 px-[14px] py-2 items-center",
        "rounded-lg transition-colors duration-200 group",
        {
          "bg-brand-700": active,
          "bg-transparent hover:bg-natural-100": !active,
        }
      )}
      to={to}
    >
      <Icon
        className={cn(
          "[&_*]:transition-all [&_*]:duration-200 h-4 w-4 lg:h-6 lg:w-6",
          {
            "[&_*]:stroke-natural-50": active,
            "[&_*]:stroke-natural-700": !active,
          }
        )}
      />
      <Typography
        tag="span"
        className={cn(
          active ? "text-natural-50" : "text-natural-700",
          "text-tiny lg:text-caption font-regular lg:font-semibold"
        )}
      >
        {label}
      </Typography>
    </Link>
  );
};

type LinkInfo = {
  label: string;
  route: Web;
  Icon: Icon;
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
    const dashboard: LinkInfo = {
      label: intl("sidebar.dashboard"),
      route:
        user?.role === IUser.Role.Student
          ? Web.StudentDashboard
          : Web.TutorDashboard,
      Icon: Home,
    };

    const lessonsSchedule = {
      label: intl("sidebar.lessons-schedule"),
      route: Web.LessonsSchedule,
      Icon: Calendar,
    };

    const upcomingLessons = {
      label: intl("sidebar.upcoming-lessons"),
      route: Web.UpcomingLessons,
      Icon: Video,
    };

    const chat = {
      label: intl("sidebar.chat"),
      route: Web.Chat,
      Icon: Chat,
    };

    const scheduleManagement = {
      label: intl("sidebar.schedule-management"),
      route: Web.ScheduleManagement,
      Icon: ScheduleManagement,
    };

    const tutors = {
      label: intl("sidebar.tutors"),
      route: Web.Tutors,
      Icon: People,
    };

    const subscribtions = {
      label: intl("sidebar.subscriptions"),
      route: Web.Subscription,
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
        "absolute lg:fixed top-[72px] md:top-[88px] lg:top-0 bottom-0 start-0 z-20 lg:z-sidebar",
        "bg-natural-50 w-[166px] lg:w-60 p-4 lg:p-6 shadow-app-sidebar",
        "flex flex-col gap-6 md:gap-10"
      )}
    >
      <Link to={Web.Root} className="flex items-center gap-1 md:gap-2">
        <Logo className="h-6 md:h-[50px]" />
        <Typography
          tag="h1"
          className="inline-block text-brand-500 text-tiny lg:text-subtitle-2 font-bold"
        >
          {intl("labels.litespace")}
        </Typography>
      </Link>

      <div className="flex flex-col gap-2 md:gap-1.5">
        <Typography
          tag="span"
          className="text-natural-800 md:py-2 text-tiny lg:text-caption font-bold"
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
              active={router.isMatch.web(route, location.pathname)}
            />
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 md:gap-1.5">
        <Typography
          tag="span"
          className="text-natural-800 md:py-2 text-tiny lg:text-caption font-bold"
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
            />
          ) : null}

          <button
            onClick={() => {
              navigate(Web.Login);
              logout();
            }}
            className={cn(
              "flex gap-2 md:gap-4 px-[14px] py-2 rounded-lg",
              "hover:text-destructive-400 hover:bg-destructive-100",
              "active:bg-destructive-400 [&_*]:active:text-natural-50",
              "[&_*]:active:stroke-natural-50 transition-all duration-200"
            )}
          >
            <Logout className="h-4 w-4 lg:h-6 lg:w-6" />
            <Typography
              tag="span"
              className="text-destructive-400 active:bg-destructive-400 active:text-natural-50 text-tiny lg:text-caption"
            >
              {intl("sidebar.logout")}
            </Typography>
          </button>
        </ul>
      </div>

      {user &&
      user.role === IUser.Role.Student &&
      location.pathname !== Web.Subscription ? (
        <div className="bg-brand-100 lg:rounded-lg mt-10 -mx-4 lg:mx-0 py-4 lg:pb-0 flex flex-col items-center">
          <div className="mx-2 lg:mx-0 px-4 mb-3">
            <Typography
              tag="h1"
              className="text-natural-950 inline-block text-tiny lg:text-caption font-bold lg:font-semibold"
            >
              {intl("sidebar.account-promotion.title")}
            </Typography>
            <Typography
              tag="p"
              className="text-natural-700 inline-block text-tiny lg:text-caption font-regular lg:font-medium"
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
