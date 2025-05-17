import React from "react";
import { IUser, Void } from "@litespace/types";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

export const Ready: React.FC<{
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
}> = ({ remoteMember, join, start, duration, loading, disabled }) => {
  const intl = useFormatMessage();

  const explaination = useMemo(() => {
    const isRemoteMemberTutor =
      remoteMember.role === IUser.Role.TutorManager ||
      remoteMember.role === IUser.Role.Tutor;

    if (isRemoteMemberTutor && remoteMember.gender === IUser.Gender.Male)
      return intl("session.ready.explaination.full.male-tutor");

    if (isRemoteMemberTutor && remoteMember.gender !== IUser.Gender.Male)
      return intl("session.ready.explaination.full.female-tutor");

    if (
      remoteMember.role === IUser.Role.Student &&
      remoteMember.gender === IUser.Gender.Male
    )
      return intl("session.ready.explaination.full.male-student");
    if (
      remoteMember.role === IUser.Role.Student &&
      remoteMember.gender !== IUser.Gender.Male
    )
      return intl("session.ready.explaination.full.female-student");
  }, [remoteMember.role, remoteMember.gender, intl]);

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
    <div className="flex flex-col items-center justify-center md:justify-start lg:justify-center lg:h-full lg:w-full text-center gap-4 md:gap-6">
      <div className="flex flex-col gap-1 lg:gap-2 items-center">
        <Typography
          tag="h3"
          className="font-bold text-natural-950 text-body lg:text-subtitle-1"
        >
          {intl("session.ready.title")}
        </Typography>
        {remoteMember.joined ? (
          <Typography
            tag="p"
            className="text-natural-800 font-semibold text-caption"
          >
            {explaination}
          </Typography>
        ) : null}

        <Typography
          tag="p"
          className="text-caption font-simibold text-natural-800"
        >
          {sessionStartMessage}
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
