import React from "react";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { useMemo } from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/utils/utils";
import { Button } from "@/components/Button";

export const Ready: React.FC<{
  otherMember: {
    id: number;
    name: string | null;
    imageUrl: string | null;
    role: IUser.Role;
    gender: IUser.Gender;
    incall: boolean;
  };
  currentMember: {
    name: string | null;
    imageUrl: string | null;
    role: IUser.Role;
    id: number;
  };
  join: Void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ currentMember, otherMember, join, loading, disabled }) => {
  const intl = useFormatMessage();

  // TODO: add type of call to intl to differentiate between lessons and interview
  const explaination = useMemo(() => {
    const isCurrentMemberTutor = currentMember.role === IUser.Role.Tutor;
    if (!otherMember.incall && isCurrentMemberTutor)
      return intl("session.ready.explaination.empty.student");

    if (!otherMember.incall && !isCurrentMemberTutor)
      return intl("session.ready.explaination.empty.tutor");

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
  }, [
    otherMember.incall,
    otherMember.role,
    otherMember.gender,
    currentMember.role,
    intl,
  ]);

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4 lg:tw-gap-8 tw-w-full tw-text-center">
      <div className="tw-flex tw-flex-col tw-gap-2 lg:tw-gap-4 tw-items-center">
        <Typography
          tag="h3"
          className="tw-font-bold tw-text-natural-950 tw-text-body lg:tw-text-subtitle-1"
        >
          {intl("session.ready.title")}
        </Typography>
        <Typography
          tag="p"
          className="tw-text-success-700 tw-font-semibold tw-text-caption"
        >
          {explaination}
        </Typography>
      </div>
      <div className="tw-flex tw-gap-2 lg:tw-flex-col lg:tw-gap-4 tw-items-center">
        <div className="tw-w-16 tw-h-16 lg:tw-w-24 lg:tw-h-24 tw-overflow-hidden tw-rounded-full">
          <Avatar
            seed={otherMember.id.toString()}
            src={orUndefined(otherMember.imageUrl)}
            alt={orUndefined(otherMember.name)}
          />
        </div>
        <Typography
          tag="span"
          className="tw-font-bold tw-text-subtitle-2 lg:tw-text-subtitle-1"
        >
          {otherMember.name}
        </Typography>
      </div>
      <Button
        size={"large"}
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
