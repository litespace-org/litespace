import { useAppDispatch } from "@/redux/store";
import { resetUserProfile } from "@/redux/user/profile";
import { Route } from "@/types/routes";
import Calendar from "@litespace/assets/calendar.svg";
import Chat from "@litespace/assets/chat.svg";
import Home from "@litespace/assets/home.svg";
import Logo from "@litespace/assets/logo.svg";
import Logout from "@litespace/assets/logout.svg";
import People from "@litespace/assets/people.svg";
import Settings from "@litespace/assets/settings.svg";
import Tag from "@litespace/assets/tag.svg";
import { removeAuthToken } from "@litespace/luna/cache";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { useCallback } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const dispatch = useAppDispatch();

  const logout = useCallback(() => {
    removeAuthToken();
    dispatch(resetUserProfile());
    // dispatch(resetTutorMeta());
  }, [dispatch]);
  // const routes = [{}];
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "fixed top-0 bottom-0 start-0 flex flex-col gap-10 w-[240px] p-6",
        "shadow-sidebar"
      )}
    >
      <Link to={Route.Root} className="flex items-center gap-2">
        <Logo className="h-[50px]" />
        <Typography
          element="subtitle-2"
          weight="bold"
          className="text-brand-500 "
        >
          {intl("labels.lite-space")}
        </Typography>
      </Link>
      <div>
        <Typography
          element="caption"
          weight="bold"
          className="py-2 leading-[21px] font-bold font-cairo text-[14px] text-natural-800"
        >
          {intl("labels.main")}
        </Typography>
        <ul className="flex flex-col gap-2">
          <SidebarItem to={Route.Dashboard}>
            <Home />
            <Typography>{intl("labels.dashboard")}</Typography>
          </SidebarItem>
          <SidebarItem to={Route.Tutors}>
            <People />
            <Typography>{intl("labels.tutors")}</Typography>
          </SidebarItem>
          <SidebarItem to={Route.Lessons}>
            <Calendar />
            <Typography>{intl("labels.lessons")}</Typography>
          </SidebarItem>
          <SidebarItem to={Route.Chat}>
            <Chat />
            <Typography>{intl("global.labels.chat")}</Typography>
          </SidebarItem>
          <SidebarItem to={Route.Subscription}>
            <Tag />
            <Typography>{intl("labels.subscriptions")}</Typography>
          </SidebarItem>
        </ul>
      </div>
      <div>
        <Typography className="py-2 leading-[21px] font-bold font-cairo text-[14px] text-natural-800">
          {intl("navbar.settings")}
        </Typography>
        <ul>
          <SidebarItem to={Route.Settings}>
            <Settings />
            <Typography>{intl("navbar.settings")}</Typography>
          </SidebarItem>
          <button
            onClick={logout}
            className={cn(
              "flex gap-4 w-48 px-[14px] py-2 rounded-lg",
              "hover:text-destructive-400 hover:bg-destructive-100",
              "active:bg-destructive-400 [&>*]:active:text-natural-50",
              "[&>*]:active:stroke-natural-50"
            )}
          >
            <Logout />
            <Typography className="text-destructive-400 active:bg-destructive-400 active:text-natural-50">
              {intl("global.labels.logout")}
            </Typography>
          </button>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

const SidebarItem = ({
  children,
  className,
  to,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  to: string;
  onClick?: Void;
}) => {
  return (
    <Link
      onClick={onClick}
      className={cn("flex gap-4 w-48 px-[14px] py-2", className)}
      to={to}
    >
      {children}
    </Link>
  );
};
