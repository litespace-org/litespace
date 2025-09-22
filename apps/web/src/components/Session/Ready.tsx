import React, { useMemo, useCallback, useEffect } from "react";
import { ISession, IUser, Void, Wss } from "@litespace/types";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useFindSessionMembers } from "@litespace/headless/session";
import dayjs from "dayjs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import {
  isRegularTutorRole,
  isStudentRole,
  isTutorManagerRole,
  isTutorRole,
} from "@litespace/utils";
import { useSocket } from "@litespace/headless/socket";

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
  // @mo @TODO: replace the LocalIds here with the right ones.
  demo: {
    startedSince: "session.ready.interview.started-since",
    endedSince: "session.ready.interview.ended-since",
    willStartIn: "session.ready.interview.will-start-in",
    join: "session.ready.interview.join",
  },
} as const;

export const Ready: React.FC<{
  sessionId: ISession.Id;
  type: ISession.Type;
  start: string;
  duration: number;
  join: Void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ sessionId, type, join, start, duration, loading, disabled }) => {
  const intl = useFormatMessage();
  const { socket } = useSocket();
  const messageIds = useMemo(() => SESSION_TO_MESSAGE_IDS[type], [type]);

  const findMembers = useFindSessionMembers(sessionId);

  useEffect(() => {
    socket?.on(Wss.ServerEvent.MemberJoinedSession, () => {
      findMembers.refetch();
    });
    socket?.on(Wss.ServerEvent.MemberLeftSession, () => {
      findMembers.refetch();
    });
  }, [socket, findMembers]);

  const genWaitingMessage = useCallback(
    (member: { role: IUser.Role; gender: IUser.Gender | null }) => {
      if (!member.gender) member.gender = IUser.Gender.Male;

      if (
        type === "interview" &&
        isTutorManagerRole(member.role) &&
        member.gender === IUser.Gender.Male
      )
        return intl("session.ready.male-interviewer-waiting");

      if (
        type === "interview" &&
        isTutorManagerRole(member.role) &&
        member.gender === IUser.Gender.Male
      )
        return intl("session.ready.female-interviewer-waiting");

      if (
        type === "interview" &&
        isRegularTutorRole(member.role) &&
        member.gender === IUser.Gender.Male
      )
        return intl("session.ready.male-tutor-waiting");

      if (
        type === "interview" &&
        isRegularTutorRole(member.role) &&
        member.gender === IUser.Gender.Male
      )
        return intl("session.ready.male-tutor-waiting");

      if (
        type === "lesson" &&
        isTutorRole(member.role) &&
        member.gender === IUser.Gender.Female
      )
        return intl("session.ready.female-tutor-waiting");

      if (
        type === "lesson" &&
        isTutorRole(member.role) &&
        member.gender === IUser.Gender.Male
      )
        return intl("session.ready.male-tutor-waiting");

      if (
        type === "lesson" &&
        isStudentRole(member.role) &&
        member.gender === IUser.Gender.Male
      )
        return intl("session.ready.male-student-waiting");

      if (
        type === "lesson" &&
        isStudentRole(member.role) &&
        member.gender === IUser.Gender.Female
      )
        return intl("session.ready.female-student-waiting");

      throw new Error("unsupported session or user role, should never happen");
    },
    [type, intl]
  );

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

        {findMembers.data?.map((member, i) => (
          <Typography
            key={i}
            tag="p"
            className="text-natural-800 font-semibold text-caption"
          >
            {genWaitingMessage(member)}
          </Typography>
        ))}

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
