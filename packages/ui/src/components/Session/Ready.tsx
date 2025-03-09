import React from "react";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { useMemo } from "react";
import { Button } from "@/components/Button";
import cn from "classnames";
import dayjs from "dayjs";
import { LocalId } from "@/locales";
import { SessionType } from "@/components/Session/types";

export const Ready: React.FC<{
  otherMember: {
    id: number;
    role: IUser.Role;
    incall: boolean;
  };
  type?: SessionType;
  error?: boolean;
  start: string;
  duration: number;
  join: Void;
  loading?: boolean;
  disabled?: boolean;
}> = ({
  otherMember,
  join,
  error,
  start,
  duration,
  loading,
  disabled,
  type = "lesson",
}) => {
  const intl = useFormatMessage();
  const sessionType: LocalId =
    type === "lesson" ? "session.lesson" : "session.interview";

  const otherMemberRole: LocalId = useMemo(() => {
    if (otherMember.role === IUser.Role.TutorManager)
      return "session.tutor-manager";

    if (otherMember.role === IUser.Role.Tutor) return "session.tutor";

    return "session.student";
  }, [otherMember]);

  const explaination = useMemo(
    () =>
      intl("session.ready.explaination.full", {
        role: intl(otherMemberRole),
        type: intl(sessionType),
      }),
    [otherMemberRole, sessionType, intl]
  );

  const sessionStartMessage = useMemo(() => {
    const now = dayjs();
    const sessionStart = dayjs(start);
    const end = sessionStart.add(duration, "minutes");

    if (now.isBefore(start))
      return intl("session.ready.session-will-start-in", {
        time: sessionStart.fromNow(true),
        type: intl(sessionType),
      });

    if (now.isAfter(end)) {
      return intl("session.ready.session-ended-since", {
        time: end.fromNow(true),
        type: intl(sessionType),
      });
    }

    return intl("session.ready.session-started-since", {
      time: end.fromNow(true),
      type: intl(sessionType),
    });
  }, [start, duration, sessionType, intl]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center md:justify-start lg:justify-center h-full w-full text-center",
        error ? "gap-2 md:gap-6" : "gap-4 md:gap-6"
      )}
    >
      <div className="flex flex-col gap-1 lg:gap-2 items-center">
        <Typography
          tag="h3"
          className="font-bold text-natural-950 text-body lg:text-subtitle-1"
        >
          {intl("session.ready.title")}
        </Typography>
        {otherMember.incall ? (
          <Typography
            tag="p"
            className="text-natural-800 font-semibold text-caption"
          >
            {explaination}
          </Typography>
        ) : null}

        <Typography tag="p" className="text-body font-bold text-natural-800">
          {sessionStartMessage}
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-4 lg:gap-2">
        {error ? (
          <Typography tag="p" className="text-destructive-700 text-caption">
            {intl("session.ready.error")}
          </Typography>
        ) : null}
        <Button
          size="large"
          onClick={join}
          disabled={
            disabled ||
            loading ||
            dayjs(start).add(duration, "minutes").isBefore(dayjs())
          }
          loading={loading}
        >
          {intl(
            type === "lesson"
              ? "session.lesson-ready.join"
              : "session.interview-ready.join"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Ready;
