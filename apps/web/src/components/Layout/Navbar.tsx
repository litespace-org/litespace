import cn from "classnames";
import dayjs from "@/lib/dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProfileInfo, SubscriptionQuota } from "@/components/Navbar";
import { useSaveLogs } from "@/hooks/logger";
import Crown from "@litespace/assets/Crown";
import { useSubscription } from "@litespace/headless/context/subscription";
import { useUser } from "@litespace/headless/context/user";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { IPlan, ILesson, IUser } from "@litespace/types";
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
          <NavBarTimer fallback={<Subscription />} />
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

  if ((info?.id === -1 && remainingWeeklyMinutes === 0) || ended)
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
          isFreeTrial={info?.period === IPlan.Period.FreeTrial}
        />
      </div>
    </Tooltip>
  );
};

const getCountdown = (start?: string | null): string | null => {
  if (!start) return null;

  const diff = dayjs(start).diff(dayjs());
  if (diff <= 0 || diff > 4 * 3600 * 1000) return null;

  return dayjs.utc(diff).format("hh:mm:ss");
};

const useNextLessonCountdown = () => {
  const { user } = useUser();

  const userId = user?.id;
  const isTutor = user ? isTutorRole(user.role) : false;

  const now = useMemo(() => dayjs().toISOString(), []);
  const lessonsQuery = useInfiniteLessons({
    users: !userId || isTutor ? [] : [userId],
    userOnly: true,
    after: now,
    canceled: false,
    size: 1,
    future: true,
  });

  const nextLessonStart = useMemo(() => {
    if (!userId || isTutor) return null;

    const list = lessonsQuery.list as
      | ILesson.FindUserLessonsApiResponse["list"]
      | null;
    const nextLesson = list?.find((item) =>
      dayjs(item.lesson.start).isAfter(dayjs())
    );
    return nextLesson?.lesson.start ?? null;
  }, [isTutor, lessonsQuery.list, userId]);

  const [time, setTime] = useState<string | null>(() =>
    getCountdown(nextLessonStart)
  );

  useEffect(() => {
    const initial = getCountdown(nextLessonStart);
    setTime(initial);
    if (!initial) return;

    const interval = window.setInterval(() => {
      const value = getCountdown(nextLessonStart);
      if (!value) {
        setTime(null);
        window.clearInterval(interval);
        return;
      }
      setTime(value);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [nextLessonStart]);

  if (!userId || isTutor) return null;

  return time;
};

const NavBarTimer: React.FC<{ fallback: React.ReactNode }> = ({ fallback }) => {
  const intl = useFormatMessage();
  const countdown = useNextLessonCountdown();

  if (!countdown) return <>{fallback}</>;

  const [hours, minutes, seconds] = countdown.split(":");

  return (
    <div className="flex flex-col items-end gap-2">
      <Typography tag="span" className="text-natural-700 text-tiny font-medium">
        {intl("lessons.next-lesson-countdown")}
      </Typography>
      <div className="flex items-center gap-2 text-2xl font-semibold text-brand-600">
        <span className="rounded-lg bg-natural-100 px-3 py-2">{seconds}</span>
        <span>:</span>
        <span className="rounded-lg bg-natural-100 px-3 py-2">{minutes}</span>
        <span>:</span>
        <span className="rounded-lg bg-natural-100 px-3 py-2">{hours}</span>
      </div>
    </div>
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
