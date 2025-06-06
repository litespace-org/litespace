import React from "react";
import { ISession, IUser, Void } from "@litespace/types";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import {
  isRegularTutorRole,
  isStudentRole,
  isTutorManagerRole,
  isTutorRole,
} from "@litespace/utils";

const SESSION_TO_MESSAGE_IDS: Record<
  ISession.Type,
  {
    startedSince: LocalId;
    endedSince: LocalId;
    willStartIn: LocalId;
    join: LocalId;
  }
> = {
  lesson: {
    startedSince: "session.ready.lesson.started-since",
    endedSince: "session.ready.lesson.ended-since",
    willStartIn: "session.ready.lesson.will-start-in",
    join: "session.ready.lesson.join",
  },
  interview: {
    startedSince: "session.ready.interview.started-since",
    endedSince: "session.ready.interview.ended-since",
    willStartIn: "session.ready.interview.will-start-in",
    join: "session.ready.interview.join",
  },
} as const;

export const Ready: React.FC<{
  type: ISession.Type;
  remoteMember: {
    id: number;
    role: IUser.Role;
    gender: IUser.Gender;
    joined: boolean;
  };
  start: string;
  duration: number;
  join: Void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ type, remoteMember, join, start, duration, loading, disabled }) => {
  const intl = useFormatMessage();
  const messageIds = useMemo(() => SESSION_TO_MESSAGE_IDS[type], [type]);

  const waiting = useMemo(() => {
    if (
      type === "interview" &&
      isTutorManagerRole(remoteMember.role) &&
      remoteMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.male-interviewer-waiting");

    if (
      type === "interview" &&
      isTutorManagerRole(remoteMember.role) &&
      remoteMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.female-interviewer-waiting");

    if (
      type === "interview" &&
      isRegularTutorRole(remoteMember.role) &&
      remoteMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.male-tutor-waiting");

    if (
      type === "interview" &&
      isRegularTutorRole(remoteMember.role) &&
      remoteMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.male-tutor-waiting");

    if (
      type === "lesson" &&
      isTutorRole(remoteMember.role) &&
      remoteMember.gender === IUser.Gender.Female
    )
      return intl("session.ready.female-tutor-waiting");

    if (
      type === "lesson" &&
      isStudentRole(remoteMember.role) &&
      remoteMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.male-student-waiting");

    if (
      type === "lesson" &&
      isStudentRole(remoteMember.role) &&
      remoteMember.gender === IUser.Gender.Female
    )
      return intl("session.ready.female-student-waiting");

    throw new Error("unsupported session or user role, should never happen");
  }, [remoteMember.role, remoteMember.gender, type, intl]);

  const timing = useMemo(() => {
    const now = dayjs();
    const sessionStart = dayjs(start);
    const end = sessionStart.add(duration, "minutes");

    if (now.isBefore(start))
      return intl(messageIds.willStartIn, {
        time: sessionStart.fromNow(true),
      });

    if (now.isAfter(end))
      return intl(messageIds.endedSince, { time: end.fromNow(true) });

    return intl(messageIds.startedSince, {
      time: sessionStart.fromNow(true),
    });
  }, [
    start,
    duration,
    intl,
    messageIds.willStartIn,
    messageIds.endedSince,
    messageIds.startedSince,
  ]);

  return (
    <div className="flex flex-col items-center justify-center md:justify-start lg:justify-center lg:h-full lg:w-full text-center gap-4 md:gap-6">
      <div className="flex flex-col gap-1 lg:gap-2 items-center">
        <Typography
          tag="h3"
          className="font-bold text-natural-950 text-body lg:text-subtitle-1"
        >
          {intl("session.ready.title")}
        </Typography>

        <Typography
          tag="p"
          data-show={remoteMember.joined}
          className="text-natural-800 font-semibold text-caption hidden data-[show=true]:block"
        >
          {waiting}
        </Typography>

        <Typography
          tag="p"
          className="text-caption font-simibold text-natural-800"
        >
          {timing}
        </Typography>
      </div>
      <Button
        size="large"
        onClick={join}
        disabled={disabled || loading}
        loading={loading}
      >
        {intl("session.ready.join")}
      </Button>
    </div>
  );
};

export default Ready;
