import React from "react";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { useMemo } from "react";
import { Button } from "@litespace/ui/Button";
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
}> = ({ otherMember, join, error, start, duration, loading, disabled }) => {
  const intl = useFormatMessage();

  const explaination = useMemo(() => {
    const isOtherMemberTutor =
      otherMember.role === IUser.Role.TutorManager ||
      otherMember.role === IUser.Role.Tutor;

    if (isOtherMemberTutor && otherMember.gender === IUser.Gender.Male)
      return intl("session.ready.explaination.full.male-tutor");

    if (isOtherMemberTutor && otherMember.gender !== IUser.Gender.Male)
      return intl("session.ready.explaination.full.female-tutor");

    if (
      otherMember.role === IUser.Role.Student &&
      otherMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.explaination.full.male-student");
    if (
      otherMember.role === IUser.Role.Student &&
      otherMember.gender !== IUser.Gender.Male
    )
      return intl("session.ready.explaination.full.female-student");
  }, [otherMember.role, otherMember.gender, intl]);

  const sessionStartMessage = useMemo(() => {
    const now = dayjs();
    const sessionStart = dayjs(start);
    const end = sessionStart.add(duration, "minutes");

    if (now.isBefore(start))
      return intl("session.ready.session-will-start-in", {
        time: sessionStart.fromNow(true),
      });

    if (now.isAfter(end)) {
      return intl("session.ready.session-ended-since", {
        time: end.fromNow(true),
      });
    }

    return intl("session.ready.session-started-since", {
      time: sessionStart.fromNow(true),
    });
  }, [start, duration, intl]);

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
          disabled={disabled || loading}
          loading={loading}
        >
          {intl("session.ready.join")}
        </Button>
      </div>
    </div>
  );
};

export default Ready;
