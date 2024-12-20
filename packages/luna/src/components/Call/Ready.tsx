import React from "react";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { useMemo } from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { Button, ButtonSize } from "@/components/Button";

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
  mic: boolean;
}> = ({ currentMember, otherMember, join, mic }) => {
  const intl = useFormatMessage();

  // TODO: add type of call to intl to differentiate between lessons and interview
  const explaination = useMemo(() => {
    const isCurrentMemberTutor = currentMember.role === IUser.Role.Tutor;
    if (!otherMember.incall && isCurrentMemberTutor)
      return intl("call.ready.explaination.empty.student");

    if (!otherMember.incall && !isCurrentMemberTutor)
      return intl("call.ready.explaination.empty.tutor");

    if (
      otherMember.role === IUser.Role.Tutor &&
      otherMember.gender === IUser.Gender.Male
    )
      return intl("call.ready.explaination.full.male-tutor");
    if (
      otherMember.role === IUser.Role.Tutor &&
      otherMember.gender !== IUser.Gender.Male
    )
      return intl("call.ready.explaination.full.female-tutor");

    if (
      otherMember.role === IUser.Role.Student &&
      otherMember.gender === IUser.Gender.Male
    )
      return intl("call.ready.explaination.full.male-student");
    if (
      otherMember.role === IUser.Role.Student &&
      otherMember.gender !== IUser.Gender.Male
    )
      return intl("call.ready.explaination.full.female-student");
  }, [
    otherMember.incall,
    otherMember.role,
    otherMember.gender,
    currentMember.role,
    intl,
  ]);

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-8 tw-max-w-[278px] tw-text-center">
      <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
        <Typography
          element="subtitle-1"
          className="tw-font-bold tw-text-natural-950"
        >
          {intl("call.ready.title")}
        </Typography>
        <Typography
          element="caption"
          className="tw-text-success-700 tw-font-semibold"
        >
          {explaination}
        </Typography>
      </div>
      <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
        <div className="tw-w-24 tw-h-24 tw-overflow-hidden tw-rounded-full">
          <Avatar
            seed={otherMember.id.toString()}
            src={orUndefined(otherMember.imageUrl)}
            alt={orUndefined(otherMember.name)}
          />
        </div>
        <Typography element="subtitle-1">{otherMember.name}</Typography>
      </div>
      <Button size={ButtonSize.Large} onClick={join} disabled={!mic}>
        {intl("call.ready.join")}
      </Button>
      {!mic ? (
        <Typography element="caption" className="tw-text-destructive-700">
          {intl("call.ready.cannot-join")}
        </Typography>
      ) : null}
    </div>
  );
};

export default Ready;
