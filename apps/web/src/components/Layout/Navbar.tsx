import cn from "classnames";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProfileInfo, SubscriptionQuota } from "@/components/Navbar";
import { useSaveLogs } from "@/hooks/logger";
import { useSubscription } from "@litespace/headless/context/subscription";
import { useUser } from "@litespace/headless/context/user";
import { useFindLessons } from "@litespace/headless/lessons";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";
import { isTutorRole } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { router } from "@/lib/routes";
import LessonCountdown from "@/components/Layout/LessonCountdown";

const LESSON_WINDOW_SECONDS = 4 * 60 * 60;

const Navbar: React.FC = () => {
  return (
    <div className="shadow-app-navbar lg:shadow-app-navbar-mobile w-full z-navbar bg-natural-50">
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
  const now = useRef(dayjs().toISOString());
  const lessons = useFindLessons({
    canceled: false,
    users: user ? [user.id] : [],
    after: now.current,
    userOnly: true,
    size: 3,
  });
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [, refreshLiveLesson] = useState(0);
  const liveLesson = useMemo(() => {
    const items = lessons.query.data?.list;
    if (!items?.length) return null;
    const present = dayjs();
    return (
      items.find(({ lesson }) => {
        const start = dayjs(lesson.start);
        const end = start.add(lesson.duration, "minute");
        return !start.isAfter(present) && end.isAfter(present);
      }) || null
    );
  }, [lessons.query.data?.list]);
  const liveTutor = useMemo(() => {
    if (!liveLesson) return null;
    return liveLesson.members.find(
      (member) => member.role !== IUser.Role.Student
    );
  }, [liveLesson]);

  useEffect(() => {
    if (!liveLesson) return;
    const id = window.setInterval(
      () => refreshLiveLesson((value) => value + 1),
      30_000
    );
    return () => window.clearInterval(id);
  }, [liveLesson]);

  useEffect(() => {
    const firstLesson = lessons.query.data?.list?.[0];
    if (!firstLesson?.lesson?.start) {
      setRemainingSeconds(null);
      return;
    }

    const target = dayjs(firstLesson.lesson.start);
    const sync = () => {
      const diff = target.diff(dayjs(), "second");
      if (diff > 0 && diff <= LESSON_WINDOW_SECONDS) {
        setRemainingSeconds(diff);
        return true;
      }
      setRemainingSeconds(null);
      return false;
    };

    if (!sync()) return;

    const id = window.setInterval(() => {
      if (!sync()) {
        window.clearInterval(id);
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [lessons.query.data?.list]);

  const ended = !!info && dayjs(info.end).isBefore(dayjs());
  const noMinutesLeft = remainingWeeklyMinutes <= 0;
  const showSubscribeCTA =
    remainingSeconds === null && (noMinutesLeft || ended);
  const ctaButtonClass =
    "flex h-10 items-center justify-center gap-2 rounded-lg border border-brand-950/20 bg-brand-500 text-natural-0 px-4 hover:bg-brand-600 focus-visible:bg-brand-600 active:bg-brand-600";

  if (loading || !user || isTutorRole(user.role)) return null;

  if (liveLesson && liveTutor) {
    const durationSeconds = liveLesson.lesson.duration * 60;
    const halfPassed =
      durationSeconds > 0 &&
      dayjs().diff(liveLesson.lesson.start, "second") >= durationSeconds / 2;
    const liveLessonMessageKey = halfPassed
      ? "navbar.lesson.ongoing.after-half"
      : "navbar.lesson.ongoing.message";
    return (
      <div className="flex items-center gap-4">
        <Typography
          tag="p"
          className="text-base font-medium text-right text-natural-700"
        >
          {intl(liveLessonMessageKey, {
            tutorName: liveTutor.name,
          })}
        </Typography>
        <Link
          to={router.web({ route: Web.Lesson, id: liveLesson.lesson.id })}
          tabIndex={-1}
        >
          <Button size="large" className={ctaButtonClass}>
            <span className="text-base font-medium leading-6">
              {intl("navbar.lesson.join-now")}
            </span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <LessonCountdown
        label={intl("navbar.lesson.starts-in")}
        seconds={remainingSeconds}
      />
      {showSubscribeCTA && (
        <Link to={Web.Plans} tabIndex={-1}>
          <Button size="large" htmlType="button" className={ctaButtonClass}>
            <span className="text-base font-medium leading-6">
              {intl("navbar.subscription.minutes-depleted")}
            </span>
          </Button>
        </Link>
      )}
      {remainingSeconds === null && !showSubscribeCTA && (
        <Tooltip
          content={intl("navbar.subscription.tooltip", {
            day: dayjs(info?.start).format("dddd"),
          })}
        >
          <div>
            <SubscriptionQuota
              remainingMinutes={remainingWeeklyMinutes}
              weeklyMinutes={info?.weeklyMinutes || 0}
              period={info?.period}
            />
          </div>
        </Tooltip>
      )}
    </>
  );
};

const User: React.FC = () => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const { save: saveLogs } = useSaveLogs();

  const navToSettings = () => {
    if (!user) return;
    navigate(
      user.role === IUser.Role.Student
        ? Web.StudentSettings
        : Web.TutorProfileSettings
    );
  };

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
      aria-label={user.name ?? ""}
      title={user.name ?? ""}
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
