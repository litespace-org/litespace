import cn from "classnames";
import React, { useCallback, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Calendar from "@litespace/assets/Calendar";
import Chat from "@litespace/assets/Chat";
import Home from "@litespace/assets/Home";
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

import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import { IUser, Void } from "@litespace/types";
import { Web } from "@litespace/utils/routes";

import { Sidebar as UISidebar, LinkInfo } from "@litespace/ui/Sidebar";

import {
  MOBILE_NAVBAR_HEIGHT,
  MOBILE_SIDEBAR_WIDTH,
  TABLET_NAVBAR_HEIGHT,
} from "@/constants/ui";
import { router } from "@/lib/routes";

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

    const lessonsSchedule: LinkInfo = {
      label: intl("sidebar.lessons-schedule"),
      route: Web.LessonsSchedule,
      Icon: Calendar,
      isActive: match(Web.LessonsSchedule),
    };

    const upcomingLessons: LinkInfo = {
      label: intl("sidebar.upcoming-lessons"),
      route: Web.UpcomingLessons,
      Icon: Video,
      isActive: match(Web.UpcomingLessons),
    };

    const chat: LinkInfo = {
      label: intl("sidebar.chat"),
      route: Web.Chat,
      Icon: Chat,
      isActive: match(Web.Chat),
    };

    const scheduleManagement: LinkInfo = {
      label: intl("sidebar.schedule-management"),
      route: Web.ScheduleManagement,
      Icon: ScheduleManagement,
      isActive: match(Web.ScheduleManagement),
    };

    const tutors: LinkInfo = {
      label: intl("sidebar.tutors"),
      route: Web.Tutors,
      Icon: People,
      isActive: match(Web.Tutors) || match(Web.TutorProfile),
    };

    const subscribtions: LinkInfo = {
      label: intl("sidebar.subscriptions"),
      route: Web.Subscription,
      Icon: Tag,
      isActive: match(Web.Subscription),
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
    <UISidebar
      hide={hide}
      links={{
        [intl("sidebar.main")]: mainPages,
        [intl("sidebar.settings")]: [
          {
            route:
              user?.role === IUser.Role.Student
                ? Web.StudentSettings
                : Web.TutorSettings,
            label:
              user?.role === IUser.Role.Student
                ? intl("sidebar.settings")
                : intl("sidebar.profile"),
            Icon: user?.role === IUser.Role.Student ? Settings : ProfileAvatar,
            isActive:
              location.pathname === Web.TutorSettings ||
              location.pathname === Web.StudentSettings,
            tail: (
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
            ),
          },
        ],
      }}
    >
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
    </UISidebar>
  );
};

export default Sidebar;
