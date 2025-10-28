import cn from "classnames";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProfileInfo, SubscriptionQuota } from "@/components/Navbar";
import { useSaveLogs } from "@/hooks/logger";
import { router } from "@/lib/routes";
import { useSubscription } from "@litespace/headless/context/subscription";
import { useUser } from "@litespace/headless/context/user";
import { useFindLessons } from "@litespace/headless/lessons";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Tooltip } from "@litespace/ui/Tooltip";
import { Typography } from "@litespace/ui/Typography";
import {
  isTutorRole,
  MAX_LESSON_DURATION,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { first, isEmpty } from "lodash";
import Crown from "@litespace/assets/Crown";

const LESSON_NOTICE_MINUTES = 3;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * MINUTES_IN_HOUR;

const Navbar: React.FC = () => {
  const { md } = useMediaQuery();
  const { info } = useSubscription();
  const { user } = useUser();
  const now = useRef<string | undefined>(undefined);

  useEffect(() => {
    now.current = dayjs()
      .subtract(MAX_LESSON_DURATION, "minutes")
      .toISOString();
  }, []);

  const lessons = useFindLessons({
    userOnly: true,
    users: user ? [user.id] : [],
    canceled: false,
    after: now.current,
    size: 1,
  });

  const { nextLessonStart, nextLessonId, tutorName } = useMemo(() => {
    const nextLesson = first(
      lessons.query.data?.list.filter(({ lesson }) => !lesson.canceledAt)
    )?.lesson;

    const tutor = first(lessons.query.data?.list)?.members.find(
      (member) => member.role !== IUser.Role.Student
    );

    return {
      nextLessonStart: nextLesson?.start,
      nextLessonId: nextLesson?.id,
      tutorName: tutor?.name,
    };
  }, [lessons.query.data?.list]);

  if (
    (!md && !info && isEmpty(lessons.query.data?.list)) ||
    (!md && location.pathname.split("/").includes("lesson")) ||
    (!md &&
      location.pathname.includes("chat") &&
      location.search.includes("room") &&
      !location.search.includes("null"))
  )
    return;

  return (
    <div
      className={cn(
        "shadow-app-navbar shadow lg:shadow-app-navbar-mobile w-full z-navbar bg-natural-50 md:block"
      )}
    >
      <div
        className={cn(
          "flex justify-center md:justify-between gap-8 items-center py-6 px-4",
          {
            "max-w-screen-3xl mx-auto": location.pathname !== Web.Chat,
          }
        )}
      >
        {nextLessonId ? (
          <LessonTimer
            start={nextLessonStart}
            tutorName={tutorName}
            nextLessonId={nextLessonId}
            loading={lessons.query.isLoading}
            error={lessons.query.isError}
          />
        ) : null}

        {!nextLessonId ? <Subscription /> : null}

        <div className="hidden ms-auto md:flex items-center justify-center">
          <User />
        </div>
      </div>
    </div>
  );
};

const LessonTimer: React.FC<{
  start?: string;
  tutorName?: string | null;
  nextLessonId?: number;
  loading: boolean;
  error: boolean;
}> = ({ start, tutorName, nextLessonId, loading, error }) => {
  const intl = useFormatMessage();

  const [time, setTime] = useState<number | null>(null); // milliseconds to current time.

  useEffect(() => {
    const interval = setInterval(() => {
      const timeToNextLesson = dayjs(start).diff(dayjs(), "seconds");
      setTime(timeToNextLesson);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextLessonId, start]);

  const { hours, minutes, seconds } = useGetTime(time);

  const diff = useMemo(() => dayjs(start).diff(dayjs(), "minutes"), [start]);

  if (
    dayjs().isAfter(dayjs(start)) &&
    dayjs().diff(dayjs(start), "minutes") > MAX_LESSON_DURATION
  )
    return;

  if (!nextLessonId || error) return;

  if (diff <= LESSON_NOTICE_MINUTES)
    return (
      <div className="flex items-center gap-6">
        <Typography
          tag="p"
          className="text-caption text-natural-700 max-w-[196px]"
        >
          {diff > 0
            ? intl("navbar.can-join-lesson", { value: tutorName })
            : null}

          {diff <= 0 && Math.abs(diff) < MAX_LESSON_DURATION
            ? intl("navbar.lesson-has-started", { value: tutorName })
            : null}
        </Typography>
        <Link
          to={router.web({ route: Web.Lesson, id: nextLessonId })}
          tabIndex={-1}
        >
          <Button size="large">
            <Typography tag="span" className="text-body font-medium">
              {intl("navbar.buttons.enter-lesson-now")}
            </Typography>
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="flex flex-col items-center">
      <Typography tag="p" className="text-tiny font-semibold text-natural-600">
        {intl("navbar.lesson-timer")}
      </Typography>
      <Typography
        tag="p"
        className="[direction:ltr] text-body font-bold text-brand-500"
      >
        <span>{loading ? 0 : hours}</span>
        <span className="mx-[11px]"> : </span>
        <span>{loading ? 0 : String(minutes).padStart(2, "0")}</span>
        <span className="mx-[11px]"> : </span>
        <span>{loading ? 0 : String(seconds).padStart(2, "0")}</span>
      </Typography>
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
        <Button size="large" endIcon={<Crown className="icon" />}>
          <Typography tag="span" className="text-body font-medium">
            {intl("navbar.buttons.subscribe-now")}
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

const useGetTime = (
  time: number | null
): { hours: number; minutes: number; seconds: number } => {
  if (!time) return { hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(time);

  const hours = Math.floor(totalSeconds / SECONDS_IN_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE
  );
  const seconds = totalSeconds % SECONDS_IN_MINUTE;

  return { hours, minutes, seconds };
};

export default Navbar;
