import cn from "classnames";
import dayjs from "dayjs";
import React, { useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProfileInfo, SubscriptionQuota } from "@/components/Navbar";
import { useSaveLogs } from "@/hooks/logger";
import Crown from "@litespace/assets/Crown";
import { useSubscription } from "@litespace/headless/context/subscription";
import { useUser } from "@litespace/headless/context/user";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";
import { isTutorRole } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";

const Navbar: React.FC = () => {
  return (
    <div className="shadow-app-navbar shadow lg:shadow-app-navbar-mobile w-full z-navbar bg-natural-50">
      <div
        className={cn("flex justify-between gap-8 items-center py-6 px-4", {
          "max-w-screen-3xl mx-auto": location.pathname !== Web.Chat,
        })}
      >
        <div className="hidden md:block">
          <Subscription />
        </div>

        <div className="ms-auto flex items-center justify-center">
          <User />
        </div>
      </div>
    </div>
  );
};

const Subscription: React.FC = () => {
  const { user } = useUser();
  const { info, remainingWeeklyMinutes, loading } = useSubscription();
  const intl = useFormatMessage();

  const ended = useMemo(
    () => !!info && dayjs(info.end).isBefore(dayjs()),
    [info]
  );

  if (loading || !user || isTutorRole(user.role)) return null;

  if (!info || ended)
    return (
      <Link to={Web.Plans} tabIndex={-1}>
        <Button
          size="large"
          htmlType="button"
          endIcon={<Crown className="[&>*]:stroke-natural-50" />}
        >
          <Typography
            tag="span"
            className="text-natural-50 text-body font-bold"
          >
            {intl("navbar.subscription.subscribe-now")}
          </Typography>
        </Button>
      </Link>
    );

  return (
    <Tooltip
      content={intl("navbar.subscription.tooltip", {
        day: dayjs(info?.start).format("dddd"),
      })}
    >
      <div>
        <SubscriptionQuota
          remainingMinutes={remainingWeeklyMinutes}
          weeklyMinutes={info?.weeklyMinutes || 0}
        />
      </div>
    </Tooltip>
  );
};

const User: React.FC = () => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const { save: saveLogs } = useSaveLogs();

  const navToSettings = useCallback(() => {
    if (!user) return;
    navigate(
      user.role === IUser.Role.Student
        ? Web.StudentSettings
        : Web.TutorProfileSettings
    );
  }, [user, navigate]);

  if (!user)
    return (
      <div className="flex gap-2">
        <Link to={Web.Register} tabIndex={-1}>
          <Button size="large">
            <Typography
              tag="p"
              className="text-body text-natural-50 font-medium"
            >
              {intl("navbar.register")}
            </Typography>
          </Button>
        </Link>

        <Link to={Web.Login} tabIndex={-1}>
          <Button size="large" variant="secondary">
            <Typography
              tag="p"
              className="text-body text-brand-700 font-medium"
            >
              {intl("navbar.login")}
            </Typography>
          </Button>
        </Link>
      </div>
    );

  return (
    <button
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4 rounded-md"
      onClick={navToSettings}
      onDoubleClick={async () => {
        saveLogs();
      }}
    >
      <ProfileInfo
        imageUrl={user.image}
        name={user.name}
        email={user.email}
        id={user.id}
      />
    </button>
  );
};

export default Navbar;
