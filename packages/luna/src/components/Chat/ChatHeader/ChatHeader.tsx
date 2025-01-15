import React from "react";
import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { orUndefined } from "@litespace/sol/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { IUser, Void } from "@litespace/types";

export const ChatHeader: React.FC<{
  name: string | null;
  image: string | null;
  online: boolean | undefined;
  lastSeen: string;
  id: number;
  role: IUser.Role;
  openDialog: Void;
}> = ({ name, image, online, id, lastSeen, role, openDialog }) => {
  const intl = useFormatMessage();

  return (
    <div className="tw-flex tw-justify-between tw-px-6 tw-py-4 tw-shadow-chat-header">
      <div className="tw-flex tw-gap-4 tw-items-center">
        <div
          className={cn(
            "tw-w-[74px] tw-h-[74px] tw-overflow-hidden tw-rounded-full",
            "tw-py-[9px] tw-px-[7px] tw-flex tw-items-center tw-justify-center",
            online && "tw-border-4 tw-border-brand-700"
          )}
        >
          <div className="tw-rounded-full tw-overflow-hidden tw-w-14 tw-h-14 tw-shrink-0">
            <Avatar
              alt={orUndefined(name)}
              src={orUndefined(image)}
              seed={id.toString()}
            />
          </div>
        </div>
        <div>
          <Typography
            element="subtitle-2"
            className={"tw-font-bold tw-text-natural-950"}
          >
            {name}
          </Typography>
          <Typography
            element="caption"
            className={cn({
              "tw-text-primary-700": online,
              "tw-text-natural-700": !online,
            })}
          >
            {online
              ? intl("chat.online")
              : intl("chat.offline", { time: dayjs(lastSeen).fromNow() })}
          </Typography>
        </div>
      </div>
      {role !== IUser.Role.Student ? (
        <div className="tw-flex tw-items-center">
          <Button
            onClick={openDialog}
            type={ButtonType.Main}
            size={ButtonSize.Small}
          >
            {intl("chat.book")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ChatHeader;
