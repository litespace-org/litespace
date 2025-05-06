import React, { useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import dayjs from "dayjs";

import Menu from "@litespace/assets/Menu";
import Crown from "@litespace/assets/Crown";
import { Button } from "@litespace/ui/Button";
import { Web } from "@litespace/utils/routes";
import { IUser, Void } from "@litespace/types";
import { Typography } from "@litespace/ui/Typography";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useUserContext } from "@litespace/headless/context/user";

import { Tooltip } from "@litespace/ui/Tooltip";
import { ProfileInfo, SubscriptionQuota } from "@/components/Navbar";
import { useSaveLogs } from "@/hooks/logger";
import { useSubscription } from "@litespace/headless/context/subscription";

const Navbar: React.FC<{ toggleSidebar: Void }> = ({ toggleSidebar }) => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();
  const { user } = useUserContext();
  const { save } = useSaveLogs();

  const [counter, setCounter] = useState<number>(0);
  const { info, remainingWeeklyMinutes } = useSubscription();

  return (
    <div className="shadow-app-navbar shadow lg:shadow-app-navbar-mobile w-full z-navbar bg-natural-50">
      <div
        className={cn("flex justify-between gap-8 items-center py-6 px-4", {
          "max-w-screen-3xl mx-auto": location.pathname !== Web.Chat,
        })}
      >
        {dayjs(info?.end).isBefore(dayjs()) &&
        user?.role === IUser.Role.Student &&
        location.pathname !== Web.Plans ? (
          <SubscribeNowButton />
        ) : (
          <SubscriptionInfo
            remainingWeeklyMinutes={remainingWeeklyMinutes}
            weeklyMinutes={info?.weeklyMinutes || 0}
          />
        )}

        {!md ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-6 h-6 bg-brand-700 bg-opacity-50 rounded-[4px] p-[2px]"
          >
            <Menu className="[&>*]:stroke-natural-50" />
          </button>
        ) : null}

        <div className="ms-auto flex items-center justify-center">
          {user ? (
            <button
              onClick={async () => {
                if (counter < 2) return setCounter(counter + 1);
                setCounter(0);
                await save();
              }}
            >
              <ProfileInfo
                imageUrl={user.image}
                name={user.name}
                email={user.email}
                id={user.id}
              />
            </button>
          ) : null}

          {!user ? (
            <div className="flex gap-2">
              <Link to={Web.Register}>
                <Button size="large">
                  <Typography
                    tag="p"
                    className="text-body text-natural-50 font-medium"
                  >
                    {intl("navbar.register")}
                  </Typography>
                </Button>
              </Link>
              <Link to={Web.Login}>
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
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

const SubscriptionInfo = ({
  remainingWeeklyMinutes,
  weeklyMinutes,
}: {
  remainingWeeklyMinutes: number;
  weeklyMinutes: number;
}) => {
  const intl = useFormatMessage();
  return (
    <Tooltip
      className="w-[462px] text-body font-normal"
      content={intl.rich("sidebar.subscriptions.tooltip", {
        day: () => (
          <span className="font-bold">{intl("global.days.sun").slice(2)}</span>
        ),
        hour: () => (
          <span className="font-bold">{intl("global.hours.three-am")}</span>
        ),
      })}
    >
      <button className="hidden md:flex justify-start">
        <SubscriptionQuota
          remainingMinutes={remainingWeeklyMinutes}
          weeklyMinutes={weeklyMinutes}
        />
      </button>
    </Tooltip>
  );
};

const SubscribeNowButton = () => {
  const intl = useFormatMessage();
  return (
    <Link to={Web.Plans} className="hidden md:flex">
      <Button
        size="large"
        htmlType="button"
        endIcon={<Crown height={16} width={16} />}
      >
        <Typography tag="span" className="text-natural-50 text-body font-bold">
          {intl("navbar.subscribe-now")}
        </Typography>
      </Button>
    </Link>
  );
};
