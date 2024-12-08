import React from "react";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { useMemo } from "react";
import { Avatar } from "@/components/Avatar";
import { orUndefined } from "@litespace/sol/utils";
import { Button, ButtonSize } from "@/components/Button";

export const Ready: React.FC<{
  users: {
    name: string | null;
    imageUrl: string | null;
    role: IUser.Role;
    gender: IUser.Gender;
    id: number;
  }[];
  currentUser: {
    name: string | null;
    imageUrl: string | null;
    role: IUser.Role;
    id: number;
  };
  join: Void;
  mic: boolean;
}> = ({ users, join, mic, currentUser }) => {
  const intl = useFormatMessage();

  // TODO: add type of call to intl to differentiate between lessons and interview
  const explaination = useMemo(() => {
    if (users.length === 0) {
      if (currentUser.role === IUser.Role.Tutor)
        return intl("call.ready.explaination.empty.student");
      return intl("call.ready.explaination.empty.tutor");
    }
    if (users[0].role === IUser.Role.Tutor) {
      if (users[0].gender === IUser.Gender.Male)
        return intl("call.ready.explaination.full.male-tutor");
      return intl("call.ready.explaination.full.female-tutor");
    }
    if (users[0].role === IUser.Role.Student) {
      if (users[0].gender === IUser.Gender.Male)
        return intl("call.ready.explaination.full.male-student");
      return intl("call.ready.explaination.full.female-student");
    }
  }, [users, intl, currentUser]);

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
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.id}
            className="tw-flex tw-flex-col tw-gap-4 tw-items-center"
          >
            <div className="tw-w-24 tw-h-24 tw-overflow-hidden tw-rounded-full">
              <Avatar
                seed={user.id.toString()}
                src={orUndefined(user.imageUrl)}
                alt={orUndefined(user.name)}
              />
            </div>
            <Typography element="subtitle-1">{user.name}</Typography>
          </div>
        ))
      ) : (
        <Typography>{intl("call.empty")}</Typography>
      )}
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
