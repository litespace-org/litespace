import React, { useState } from "react";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { useMemo } from "react";
import { Button } from "@/components/Button";
import cn from "classnames";
import dayjs from "dayjs";

export const Ready: React.FC<{
  otherMember: {
    id: number;
    name: string | null;
    imageUrl: string | null;
    role: IUser.Role;
    gender: IUser.Gender;
    incall: boolean;
  };
  error?: boolean;
  sessionDetails: {
    sessionStart: string;
    sessionEnd: string;
  };
  join: Void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ otherMember, join, error, sessionDetails, loading, disabled }) => {
  const intl = useFormatMessage();
  const [hasSessionEnded, setHasSessionEnded] = useState<boolean>(false);

  const explaination = useMemo(() => {
    if (
      otherMember.role === IUser.Role.Tutor &&
      otherMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.explaination.full.male-tutor");
    if (
      otherMember.role === IUser.Role.Tutor &&
      otherMember.gender !== IUser.Gender.Male
    )
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
    const sessionStartTime = dayjs(sessionDetails.sessionStart);
    const sessionEndTime = dayjs(sessionDetails.sessionEnd);

    if (now.isBefore(sessionStartTime))
      return intl("session.ready.session-will-start-in", {
        minutes: sessionStartTime.diff(now, "minutes"),
      });

    if (now.isAfter(sessionEndTime)) {
      setHasSessionEnded(true);
      return intl("session.ready.session-ended-since", {
        minutes: now.diff(sessionEndTime, "minutes"),
      });
    }

    return intl("session.ready.session-started-since", {
      minutes: now.diff(sessionStartTime, "minutes"),
    });
  }, [sessionDetails, intl]);

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
          size={"large"}
          onClick={join}
          disabled={disabled || loading || hasSessionEnded}
          loading={loading}
        >
          {intl("session.ready.join")}
        </Button>
      </div>
    </div>
  );
};

export default Ready;
