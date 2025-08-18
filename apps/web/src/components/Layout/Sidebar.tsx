import { router } from "@/lib/routes";
import { Icon } from "@/types/common";
import AccountPromotionAsset from "@litespace/assets/AccountPromotion";
import Calendar from "@litespace/assets/Calendar";
import Categories from "@litespace/assets/Categories";
import Chat from "@litespace/assets/Chat";
import Home from "@litespace/assets/Home";
import Logo from "@litespace/assets/Logo";
import Logout from "@litespace/assets/Logout";
import People from "@litespace/assets/People";
import ProfileAvatar from "@litespace/assets/ProfileAvatar";
import ScheduleManagement from "@litespace/assets/ScheduleManagement";
import Settings from "@litespace/assets/Settings";
import Tag from "@litespace/assets/Tag";
import TrendUp from "@litespace/assets/TrendUp";
import Video from "@litespace/assets/Video";
import { useUser } from "@litespace/headless/context/user";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IUser } from "@litespace/types";
import { ActionsMenu } from "@litespace/ui/ActionsMenu";
import { AvatarV2 } from "@litespace/ui/Avatar";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { isTutor } from "@litespace/utils";
import { useSubscription } from "@litespace/headless/context/subscription";
import { Web } from "@litespace/utils/routes";
import cn from "classnames";
import React, { SVGProps, useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type LinkInfo = {
  label: string;
  route: Web;
  Icon: Icon;
  isActive: boolean;
};

const Sidebar: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "md:static md:h-auto md:start-0 md:top-0 md:z-10 lg:z-sidebar",
        "bg-natural-50 md:w-[98px] lg:min-w-60 md:px-3 md:py-6 lg:p-6 shadow-mobile-sidebar md:shadow-app-sidebar",
        "flex md:justify-start md:flex-col md:gap-10"
      )}
    >
      <Header />

      <div className="flex flex-col md:gap-1.5">
        <Typography
          tag="span"
          className="hidden md:inline-block text-natural-800 md:py-2 text-tiny md:text-caption font-bold md:text-center lg:text-start"
        >
          {intl("sidebar.main")}
        </Typography>
        <MainPages />
      </div>

      <div className="hidden md:flex flex-col md:gap-1.5">
        <Typography
          tag="span"
          className="text-natural-800 md:py-2 text-tiny lg:text-caption font-bold text-start md:text-center lg:text-start"
        >
          {intl("sidebar.settings")}
        </Typography>
        <ul className="md:flex flex-col gap-1.5">
          <SettingsPages />
          <LogoutButton />
        </ul>
      </div>
      <AccountPromotion />
    </div>
  );
};

const MainPages: React.FC = () => {
  const { md } = useMediaQuery();
  const intl = useFormatMessage();
  const { user } = useUser();
  const location = useLocation();

  const match = useCallback(
    (route: Web) => router.match(route, location.pathname),
    [location.pathname]
  );

  const [moreActive, setMoreActive] = useState<boolean>(false);

  const pages: LinkInfo[] = useMemo(() => {
    const dashboard: LinkInfo = {
      label: md ? intl("sidebar.dashboard") : intl("sidebar.main"),
      route:
        user?.role === IUser.Role.Student
          ? Web.StudentDashboard
          : Web.TutorDashboard,
      Icon: Home,
      isActive:
        (match(Web.StudentDashboard) && !moreActive) ||
        (match(Web.TutorDashboard) && !moreActive),
    };

    const upcomingLessons = {
      label: intl("sidebar.lessons"),
      route: Web.UpcomingLessons,
      Icon: Video,
      isActive: match(Web.UpcomingLessons) && !moreActive,
    };

    const lessonsSchedule = {
      label: intl("sidebar.schedule"),
      route: Web.LessonsSchedule,
      Icon: user?.role === IUser.Role.Student ? Video : Calendar,
      isActive: match(Web.LessonsSchedule) && !moreActive,
    };

    const chat = {
      label: intl("sidebar.chat"),
      route: Web.Chat,
      Icon: Chat,
      isActive: match(Web.Chat) && !moreActive,
    };

    const scheduleManagement = {
      label: md
        ? intl("sidebar.schedule-management")
        : intl("sidebar.schedule"),
      route: Web.ScheduleManagement,
      Icon: ScheduleManagement,
      isActive: match(Web.ScheduleManagement) && !moreActive,
    };

    const tutors = {
      label: intl("sidebar.tutors"),
      route: Web.Tutors,
      Icon: People,
      isActive:
        (match(Web.Tutors) && !moreActive) ||
        (match(Web.TutorProfile) && !moreActive),
    };

    const subscribtions = {
      label: intl("sidebar.subscriptions"),
      route: Web.Plans,
      Icon: Tag,
      isActive: match(Web.Plans),
    };

    const invoices = {
      label: intl("sidebar.invoices"),
      route: Web.Invoices,
      Icon: TrendUp,
      isActive: match(Web.Invoices),
    };

    const more = {
      label: intl("global.labels.more"),
      route: Web.Root,
      Icon: Categories,
      isActive: moreActive,
    };

    // tutor or tutor manager and small screen
    if (
      (user?.role === IUser.Role.Tutor && !md) ||
      (user?.role === IUser.Role.TutorManager && !md)
    )
      return [chat, upcomingLessons, dashboard, scheduleManagement, more];

    // tutor and large screen
    if (user?.role === IUser.Role.Tutor && md)
      return [
        dashboard,
        upcomingLessons,
        lessonsSchedule,
        scheduleManagement,
        chat,
        invoices,
      ];
    // tutor manager and large screen
    if (user?.role === IUser.Role.TutorManager && md)
      return [
        dashboard,
        upcomingLessons,
        lessonsSchedule,
        scheduleManagement,
        chat,
      ];

    // student and large screen
    if (user?.role === IUser.Role.Student && md)
      return [dashboard, tutors, upcomingLessons, chat, subscribtions];

    // student and small screen
    if (user?.role === IUser.Role.Student && !md)
      return [tutors, upcomingLessons, dashboard, chat, more];

    return [];
  }, [intl, match, md, moreActive, user?.role]);

  if (!md) return <MobileSidebar pages={pages} setActive={setMoreActive} />;

  return (
    <ul className="flex md:flex-col gap-3 md:gap-2">
      {pages.map(({ label, route, Icon, isActive }) => {
        return (
          <SidebarItem
            key={route}
            to={route}
            Icon={Icon}
            label={label}
            active={isActive}
            notificationsCount={0} // @TODO: make it dynamic
          />
        );
      })}
    </ul>
  );
};

const SettingsPages: React.FC = () => {
  const intl = useFormatMessage();
  const { user } = useUser();

  const location = useLocation();

  const match = useCallback(
    (route: Web) => router.match(route, location.pathname),
    [location.pathname]
  );

  const pages: LinkInfo[] = useMemo(() => {
    const tutorAccountSettings: LinkInfo = {
      Icon: ProfileAvatar,
      label: intl("sidebar.profile"),
      isActive: match(Web.TutorProfileSettings),
      route: Web.TutorProfileSettings,
    };

    const tutorProfileSettings: LinkInfo = {
      Icon: Settings,
      label: intl("sidebar.settings"),
      isActive: match(Web.TutorAccountSettings),
      route: Web.TutorAccountSettings,
    };

    const studentSettings: LinkInfo = {
      Icon: Settings,
      label: intl("sidebar.settings"),
      isActive: match(Web.StudentSettings),
      route: Web.StudentSettings,
    };

    if (isTutor(user)) return [tutorAccountSettings, tutorProfileSettings];

    return [studentSettings];
  }, [intl, match, user]);

  return pages.map((page) => (
    <SidebarItem
      key={page.route}
      to={page.route}
      Icon={page.Icon}
      label={page.label}
      active={page.isActive}
      notificationsCount={0} // @TODO: make it dynamic
    />
  ));
};

const AccountPromotion: React.FC = () => {
  const intl = useFormatMessage();
  const { lg, md } = useMediaQuery();
  const { user } = useUser();
  const { info: subscription } = useSubscription();

  const showPromotion = useMemo(
    () =>
      user &&
      !subscription &&
      user.role === IUser.Role.Student &&
      location.pathname !== Web.Plans &&
      (lg || !md),
    [user, lg, md, subscription]
  );

  if (!showPromotion) return null;

  return (
    <div className="hidden bg-natural-100 lg:rounded-lg mt-10 -mx-4 lg:mx-0 py-4 lg:pb-0 md:flex flex-col items-center">
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
      <Link to={Web.Plans} tabIndex={-1}>
        <Button size="large" htmlType="button" type="natural" className="text">
          {intl("sidebar.subscribe-now")}
        </Button>
      </Link>

      {lg ? (
        <div className="h-[101px] w-[192px] mt-6">
          <AccountPromotionAsset />
        </div>
      ) : null}
    </div>
  );
};

const SidebarItem: React.FC<{
  to: string;
  Icon: React.MemoExoticComponent<
    (props: SVGProps<SVGSVGElement>) => JSX.Element
  >;
  label: React.ReactNode;
  active?: boolean;
  notificationsCount?: number;
}> = ({ to, Icon, label, active, notificationsCount = 0 }) => {
  const { md, lg } = useMediaQuery();

  return (
    <Link
      className={cn(
        "relative md:static min-w-14 md:min-w-auto flex md:gap-0 flex-col gap-[11px] md:flex-row justify-between md:justify-center lg:justify-start pt-[13px] md:p-0 lg:ps-[14px] lg:pe-2 md:py-2 items-center",
        "rounded-lg transition-colors duration-200 group",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500",
        {
          "bg-brand-500": active && md,
          "bg-transparent hover:bg-natural-100": !active,
        }
      )}
      to={to}
    >
      <Icon
        className={cn(
          "relative shrink-0 [&_*]:transition-all [&_*]:duration-200 h-6 w-6",
          {
            "[&_*]:stroke-natural-50": active,
            "[&_*]:stroke-natural-700": !active,
          }
        )}
      />

      {lg ? (
        <Typography
          tag="span"
          className={cn(
            { "mt-auto": !md },
            active && md ? "text-natural-50" : "text-natural-700",
            "md:ms-2 md:me-auto lg:ms-4 shrink-0 text-tiny lg:text-caption font-normal lg:font-semibold"
          )}
        >
          {label}
        </Typography>
      ) : null}

      {notificationsCount && !active && md ? ( // @TODO: make it available for small devices.
        <div
          className={cn(
            "hidden relative lg:block w-[21px] h-[21px] bg-brand-500 rounded-full overflow-hidden",
            "shrink-0 flex items-center justify-center text-center"
          )}
        >
          <Typography
            tag="span"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-caption font-medium text-natural-50"
          >
            {notificationsCount}
          </Typography>
        </div>
      ) : null}
    </Link>
  );
};

const MobileSidebarItem: React.FC<{
  active: boolean;
  label: string;
  Icon: React.MemoExoticComponent<
    (props: SVGProps<SVGSVGElement>) => JSX.Element
  >;
  to: string;
  notificationsCount?: number;
  setActive?: (open: boolean) => void;
}> = ({ active, label, Icon, to, notificationsCount = 0, setActive }) => {
  const intl = useFormatMessage();

  if (label === intl("global.labels.more"))
    return (
      <MoreSidebarItem
        active={active || false}
        setActive={setActive}
        notificationsCount={notificationsCount}
      />
    );

  return (
    <Link
      to={to}
      className={cn(
        "relative min-w-14 flex flex-col gap-[11px] justify-between pt-[13px] items-center",
        "rounded-lg transition-colors duration-200 group",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500",
        {
          "bg-transparent hover:bg-natural-100": !active,
        }
      )}
    >
      <div
        className={cn("absolute z-2", {
          "-top-2": active,
        })}
      >
        <Dome />
        <div
          className={cn(
            { "bg-brand-500 w-[44px] h-[44px]": active },
            "rounded-full flex items-center justify-center"
          )}
        >
          <Icon
            className={cn(
              "relative shrink-0 [&_*]:transition-all [&_*]:duration-200 h-6 w-6",
              {
                "[&_*]:stroke-natural-50": active,
                "[&_*]:stroke-natural-700": !active,
              }
            )}
          />
        </div>
      </div>
      <Typography
        tag="span"
        className={cn(
          "text-natural-700 mt-auto shrink-0 text-tiny font-normal text-center"
        )}
      >
        {label}
      </Typography>

      {notificationsCount ? (
        <div
          className={cn(
            "w-1 h-1 bg-brand-500 rounded-full overflow-hidden",
            "absolute top-[10px] start-3"
          )}
        />
      ) : null}
    </Link>
  );
};

const MoreSidebarItem: React.FC<{
  active: boolean;
  notificationsCount?: number;
  setActive?: (open: boolean) => void;
}> = ({ active, notificationsCount = 0, setActive }) => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();

  const { user, logout } = useUser();
  const navigate = useNavigate();

  const userName = useMemo(() => {
    const alt = user?.email.replace(/@.+/, "");
    return user?.name || alt;
  }, [user?.email, user?.name]);

  const studentActions = useMemo(
    () => [
      {
        id: 0,
        label: (
          <div className="flex gap-2">
            <div className="rounded-full overflow-hidden w-10 h-10">
              <AvatarV2 src={user?.image} alt={userName} id={user?.id} />
            </div>
            <div className="flex flex-col justify-between [&>*]:inline-block">
              <Typography
                tag="span"
                className="text-caption text-natural-950 font-semibold"
              >
                {userName}
              </Typography>
              <Typography
                tag="span"
                className="text-tiny text-natural-600 font-normal"
              >
                {user?.email}
              </Typography>
            </div>
          </div>
        ),
        onClick: () =>
          navigate(
            user?.role === IUser.Role.Student
              ? Web.StudentSettings
              : Web.TutorProfileSettings
          ),
      },
      {
        id: 1,
        label: (
          <div className="flex gap-2 items-center">
            <Tag className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.subscriptions")}
            </Typography>
            {notificationsCount ? (
              <div className="rounded-full bg-brand-500 w-4 h-4 flex items-center justify-center">
                <Typography tag="span" className="text-tiny text-natural-50">
                  {notificationsCount}
                </Typography>
              </div>
            ) : null}
          </div>
        ),
        onClick: () => navigate(Web.Plans),
      },
      {
        id: 2,
        label: (
          <div className="flex gap-2 items-center">
            <Settings className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.settings")}
            </Typography>
            {notificationsCount ? (
              <div className="rounded-full bg-brand-500 w-4 h-4 flex items-center justify-center">
                <Typography tag="span" className="text-tiny text-natural-50">
                  {notificationsCount}
                </Typography>
              </div>
            ) : null}
          </div>
        ),
        onClick: () => navigate(Web.StudentSettings),
      },
      {
        id: 3,
        label: (
          <div className="flex gap-2 items-center">
            <Logout className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-destructive-400 font-normal"
            >
              {intl("sidebar.logout")}
            </Typography>
          </div>
        ),
        onClick: () => {
          navigate(Web.Login);
          logout();
        },
      },
    ],
    [
      intl,
      logout,
      navigate,
      notificationsCount,
      user?.email,
      user?.id,
      user?.image,
      user?.role,
      userName,
    ]
  );

  const tutorActions = useMemo(
    () => [
      {
        id: 0,
        label: (
          <div className="flex gap-2">
            <div className="rounded-full overflow-hidden w-10 h-10">
              <AvatarV2 src={user?.image} alt={userName} id={user?.id} />
            </div>
            <div className="flex flex-col justify-between [&>*]:inline-block">
              <Typography
                tag="span"
                className="text-caption text-natural-950 font-semibold"
              >
                {userName}
              </Typography>
              <Typography
                tag="span"
                className="text-tiny text-natural-600 font-normal"
              >
                {user?.email}
              </Typography>
            </div>
          </div>
        ),
        onClick: () =>
          navigate(
            user?.role === IUser.Role.Student
              ? Web.StudentSettings
              : Web.TutorProfileSettings
          ),
      },
      {
        id: 1,
        label: (
          <div className="flex gap-2 items-center">
            <Calendar className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.lessons-schedule")}
            </Typography>
            {notificationsCount ? (
              <div className="rounded-full bg-brand-500 w-4 h-4 flex items-center justify-center">
                <Typography tag="span" className="text-tiny text-natural-50">
                  {notificationsCount}
                </Typography>
              </div>
            ) : null}
          </div>
        ),
        onClick: () => navigate(Web.LessonsSchedule),
      },
      {
        id: 2,
        label: (
          <div className="flex gap-2 items-center">
            <TrendUp className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.invoices")}
            </Typography>
            {notificationsCount ? (
              <div className="rounded-full bg-brand-500 w-4 h-4 flex items-center justify-center">
                <Typography tag="span" className="text-tiny text-natural-50">
                  {notificationsCount}
                </Typography>
              </div>
            ) : null}
          </div>
        ),
        onClick: () => navigate(Web.Invoices),
      },
      {
        id: 3,
        label: (
          <div className="flex gap-2 items-center">
            <ProfileAvatar className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.profile")}
            </Typography>
          </div>
        ),
        onClick: () => navigate(Web.TutorProfileSettings),
      },
      {
        id: 4,
        label: (
          <div className="flex gap-2 items-center">
            <Settings className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.settings")}
            </Typography>
          </div>
        ),
        onClick: () => navigate(Web.TutorAccountSettings),
      },
      {
        id: 5,
        label: (
          <div className="flex gap-2 items-center">
            <Logout className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-destructive-400 font-normal"
            >
              {intl("sidebar.logout")}
            </Typography>
          </div>
        ),
        onClick: () => {
          navigate(Web.Login);
          logout();
        },
      },
    ],
    [
      intl,
      logout,
      navigate,
      notificationsCount,
      user?.email,
      user?.id,
      user?.image,
      user?.role,
      userName,
    ]
  );

  const tutorManagerActions = useMemo(
    () => [
      {
        id: 0,
        label: (
          <div className="flex gap-2">
            <div className="rounded-full overflow-hidden w-10 h-10">
              <AvatarV2 src={user?.image} alt={userName} id={user?.id} />
            </div>
            <div className="flex flex-col justify-between [&>*]:inline-block">
              <Typography
                tag="span"
                className="text-caption text-natural-950 font-semibold"
              >
                {userName}
              </Typography>
              <Typography
                tag="span"
                className="text-tiny text-natural-600 font-normal"
              >
                {user?.email}
              </Typography>
            </div>
          </div>
        ),
        onClick: () =>
          navigate(
            user?.role === IUser.Role.Student
              ? Web.StudentSettings
              : Web.TutorProfileSettings
          ),
      },
      {
        id: 1,
        label: (
          <div className="flex gap-2 items-center">
            <Calendar className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.lessons-schedule")}
            </Typography>
          </div>
        ),
        onClick: () => navigate(Web.LessonsSchedule),
      },
      {
        id: 2,
        label: (
          <div className="flex gap-2 items-center">
            <ProfileAvatar className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.profile")}
            </Typography>
          </div>
        ),
        onClick: () => navigate(Web.TutorProfileSettings),
      },
      {
        id: 3,
        label: (
          <div className="flex gap-2 items-center">
            <Settings className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-natural-700 font-normal"
            >
              {intl("sidebar.settings")}
            </Typography>
          </div>
        ),
        onClick: () => navigate(Web.TutorAccountSettings),
      },
      {
        id: 4,
        label: (
          <div className="flex gap-2 items-center">
            <Logout className="w-4 h-4" />
            <Typography
              tag="span"
              className="text-tiny text-destructive-400 font-normal"
            >
              {intl("sidebar.logout")}
            </Typography>
          </div>
        ),
        onClick: () => {
          navigate(Web.Login);
          logout();
        },
      },
    ],
    [
      intl,
      logout,
      navigate,
      user?.email,
      user?.id,
      user?.image,
      user?.role,
      userName,
    ]
  );

  const actions = useMemo(() => {
    if (user?.role === IUser.Role.Student) return studentActions;
    if (user?.role === IUser.Role.Tutor) return tutorActions;
    return tutorManagerActions;
  }, [studentActions, tutorActions, tutorManagerActions, user?.role]);

  return (
    <ActionsMenu
      sideOffset={30}
      menuClassName="p-2 [&>div]:mb-[6px] [&>div:nth-of-type(1)]:mb-4 [&>:last-child]:mb-0"
      subContentItemClassName="min-h-fit p-2 first-of-type:px-0"
      actions={actions}
      onOpenChange={(open) => {
        if (!setActive) return;
        setActive(open);
      }}
    >
      <div
        className={cn(
          "relative flex flex-col gap-[11px] items-center min-w-14 pt-[13px]",
          "hover:cursor-pointer hover:bg-natural-100 rounded-lg min-h-[66px]"
        )}
      >
        {active ? (
          <div className={cn("absolute z-2 -top-2")}>
            <Dome />
            <div
              className={cn(
                { "bg-brand-500 w-[44px] h-[44px]": active },
                "rounded-full flex items-center justify-center"
              )}
            >
              <Categories
                className={cn("w-6 h-6", {
                  "[&>*]:stroke-natural-50 [&>*]:fill-natural-50": active,
                })}
              />
            </div>
          </div>
        ) : null}

        {!active ? (
          <Categories
            className={cn("w-6 h-6", {
              "[&>*]:stroke-natural-50 [&>*]:fill-natural-50": active,
            })}
          />
        ) : null}

        <Typography
          tag="span"
          className={cn("text-tiny font-medium text-natural-600", {
            "mt-auto": active,
          })}
        >
          {intl("global.labels.more")}
        </Typography>

        {notificationsCount && !md ? (
          <div
            className={cn(
              "w-1 h-1 bg-brand-500 rounded-full overflow-hidden",
              "absolute top-[10px] start-3"
            )}
          />
        ) : null}
      </div>
    </ActionsMenu>
  );
};

const LogoutButton: React.FC = () => {
  const intl = useFormatMessage();
  const { lg, md } = useMediaQuery();
  const navigate = useNavigate();
  const { logout } = useUser();

  return (
    <button
      onClick={() => {
        navigate(Web.Login);
        logout();
      }}
      className={cn(
        "flex flex-row justify-start md:justify-center lg:justify-start gap-2 md:gap-0 lg:gap-4 px-[14px] py-2 rounded-lg",
        "hover:text-destructive-400 hover:bg-destructive-100",
        "active:bg-destructive-400 [&_*]:active:text-natural-50",
        "[&_*]:active:stroke-natural-50 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
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
  );
};

const Header: React.FC = () => {
  const { md, lg } = useMediaQuery();
  const intl = useFormatMessage();

  return (
    <Link
      to={Web.Root}
      className={cn(
        "hidden md:flex flex-col justify-center items-center gap-1 md:gap-2",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 rounded-lg"
      )}
    >
      <Logo className="h-6 md:h-10 md:w-10" />
      <Typography
        data-show={lg || !md}
        tag="p"
        className="text-brand-500 text-tiny hidden data-[show=true]:block text-xl font-bold"
      >
        {intl("labels.litespace")}
      </Typography>
    </Link>
  );
};

const Dome: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="26.4755 -0.85 55.18 55.95"
      className="md:hidden absolute -left-3 -top-2 -z-10 w-[68px]"
    >
      <path
        d="M 35 40 C 30 5 24 18 35 10 C 47 -4 63 -4 75 10 C 86 17 78 3 74 40 C 74 46 75 51 75 55 C 60 55 40 55 35 55 C 35 50 35 45 35 40"
        stroke="#f2f2f2"
        strokeWidth="0.1"
        fill="#f2f2f2"
      />
    </svg>
  );
};

const MobileSidebar: React.FC<{
  pages: LinkInfo[];
  setActive: (open: boolean) => void;
}> = ({ pages, setActive }) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 start-1/2 translate-x-1/2 max-w-[360px] w-full h-[90px] bg-natural-50 rounded-t-xl",
        "flex gap-3 shadow-mobile-sidebar z-10 pb-6 px-4"
      )}
    >
      {pages.map((page) => (
        <MobileSidebarItem
          key={page.label}
          label={page.label}
          to={page.route}
          Icon={page.Icon}
          active={page.isActive}
          notificationsCount={0}
          setActive={setActive}
        />
      ))}
    </div>
  );
};

export default Sidebar;
