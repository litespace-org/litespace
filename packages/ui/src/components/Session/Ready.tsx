import React from "react";
import { ISession, IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { useMemo } from "react";
import { Button } from "@/components/Button";
import cn from "classnames";
import dayjs from "dayjs";

export const Ready: React.FC<{
  otherMember: {
    id: number;
    role: IUser.Role;
    gender: IUser.Gender;
    incall: boolean;
  };
  error?: boolean;
  start: string;
  duration: number;
  join: Void;
  loading?: boolean;
  disabled?: boolean;
  type: ISession.Type;
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
  const sessionType = intl(
    type === "lesson" ? "session.type.lesson" : "session.type.interview"
  );
  const toSessionType = intl(
    type === "lesson" ? "session.type.to-lesson" : "session.type.to-interview"
  );

  const explaination = useMemo(() => {
    const isOtherMemberTutor =
      otherMember.role === IUser.Role.TutorManager ||
      otherMember.role === IUser.Role.Tutor;

    if (isOtherMemberTutor && otherMember.gender === IUser.Gender.Male)
      return intl("session.ready.explaination.full.male-tutor", {
        type: sessionType,
      });

    if (isOtherMemberTutor && otherMember.gender !== IUser.Gender.Male)
      return intl("session.ready.explaination.full.female-tutor", {
        type: sessionType,
      });

    if (
      otherMember.role === IUser.Role.Student &&
      otherMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.explaination.full.male-student", {
        type: sessionType,
      });
    if (
      otherMember.role === IUser.Role.Student &&
      otherMember.gender !== IUser.Gender.Male
    )
      return intl("session.ready.explaination.full.female-student", {
        type: sessionType,
      });
  }, [otherMember.role, otherMember.gender, intl, sessionType]);

  const sessionStartMessage = useMemo(() => {
    const now = dayjs();
    const sessionStart = dayjs(start);
    const end = sessionStart.add(duration, "minutes");

    if (now.isBefore(start))
      return intl("session.ready.session-will-start-in", {
        time: sessionStart.fromNow(true),
        type: sessionType,
      });

    if (now.isAfter(end)) {
      return intl("session.ready.session-ended-since", {
        time: end.fromNow(true),
        type: sessionType,
      });
    }

    return intl("session.ready.session-started-since", {
      time: sessionStart.fromNow(true),
      type: sessionType,
    });
  }, [start, duration, intl, sessionType]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center md:justify-start lg:justify-center lg:h-full lg:w-full text-center",
        error ? "gap-2 md:gap-6" : "gap-4 md:gap-6"
      )}
    >
      <div className="flex flex-col gap-1 lg:gap-2 items-center">
        <Typography
          tag="h3"
          className="font-bold text-natural-950 text-body lg:text-subtitle-1"
        >
          {intl("session.ready.title", {
            type: sessionType,
          })}
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
            {intl("session.ready.error", {
              type: sessionType,
            })}
          </Typography>
        ) : null}
        <Button
          size="large"
          onClick={join}
          disabled={disabled || loading}
          loading={loading}
        >
          {intl("session.ready.join", {
            type: toSessionType,
          })}
        </Button>
      </div>
    </div>
  );
};

export default Ready;
