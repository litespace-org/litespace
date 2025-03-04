import React, { SVGProps, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import cn from "classnames";

import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

import { IUser, Void } from "@litespace/types";
import { Dashboard } from "@litespace/utils/routes";
import { useUserContext } from "@litespace/headless/context/user";

import Logo from "@litespace/assets/Logo";
import Logout from "@litespace/assets/Logout";
import People from "@litespace/assets/People";
import Settings from "@litespace/assets/Settings";

import { router } from "@/lib/route";
import { Icon } from "@/types/common";

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
      <Typography
        tag="span"
        className={cn(
          active ? "text-natural-50" : "text-natural-700",
          "text-tiny lg:text-caption font-regular lg:font-semibold",
          "flex md:hidden lg:flex"
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

const Sidebar: React.FC<{
  hide: Void;
}> = ({ hide }) => {
  const intl = useFormatMessage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserContext();

  const mainPages: LinkInfo[] = useMemo(() => {
    const match = (route: Dashboard) =>
      router.isMatch.dashboard(route, location.pathname);

    const PhotoSession: LinkInfo = {
      label: intl("sidebar.dashboard"),
      route: Dashboard.PhotoSessions,
      Icon: People,
      isActive: match(Dashboard.PhotoSessions),
    };

    if (
      user?.role === IUser.Role.Studio ||
      user?.role === IUser.Role.RegularAdmin ||
      user?.role === IUser.Role.SuperAdmin
    )
      return [PhotoSession];

    return [];
  }, [intl, location.pathname, user?.role]);

  return (
    <div
      className={cn(
        "absolute md:static bottom-0 start-0 z-20 lg:z-sidebar",
        "bg-natural-50 h-full w-[166px] md:w-[98px] lg:w-60 p-4 lg:p-6 shadow-app-sidebar",
        "flex flex-col gap-6 md:gap-10"
      )}
    >
      <Link
        to={Dashboard.Root}
        className="flex justify-start md:justify-center lg:justify-start items-center gap-1 md:gap-2"
      >
        <Logo className="h-6 md:h-10 md:w-10 md:my-[5px] lg:my-0" />
        <Typography
          tag="h1"
          className="flex md:hidden lg:flex inline-block text-brand-500 text-tiny lg:text-subtitle-2 font-bold"
        >
          {intl("labels.litespace")}
        </Typography>
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
                user?.role === IUser.Role.Studio
                  ? Dashboard.UserSetting
                  : Dashboard.PlatformSettings
              }
              Icon={Settings}
              label={intl("sidebar.settings")}
              active={
                location.pathname === Dashboard.UserSetting ||
                location.pathname === Dashboard.PlatformSettings
              }
              hide={hide}
            />
          ) : null}

          <button
            onClick={() => {
              navigate(Dashboard.Login);
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
            <Typography
              tag="span"
              className="flex md:hidden lg:flex text-destructive-400 active:bg-destructive-400 active:text-natural-50 text-tiny lg:text-caption"
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
