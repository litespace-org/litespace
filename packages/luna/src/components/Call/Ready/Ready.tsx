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
    id: number;
  }[];
  join: Void;
  hasMic: boolean;
}> = ({ users, join, hasMic }) => {
  const intl = useFormatMessage();

  const explaination = useMemo(() => {
    if (users.length === 0) return intl("call.ready.explaination.empty");
    if (users[0].role === IUser.Role.Tutor)
      return intl("call.ready.explaination.full.for-male-student");
    return intl("call.ready.explaination.full.for-male-tutor");
  }, [users, intl]);

  /**
   * !TODO: implement
   * - empty room view
   * - user don't have a mic
   */

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-gap-8">
      <div className="tw-flex tw-flex-col tw-gap-4 tw-items-center">
        <Typography
          element="subtitle-1"
          className="tw-font-bold tw-text-natural-950"
        >
          {intl("call.ready.title")}
        </Typography>
        <Typography
          element="caption"
          className="tw-text-natural-700 tw-font-semibold"
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
      <Button size={ButtonSize.Large} onClick={join} disabled={!hasMic}>
        {intl("call.ready.join")}
      </Button>
    </div>
  );
};

export default Ready;
