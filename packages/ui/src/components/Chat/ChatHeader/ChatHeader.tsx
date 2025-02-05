import React from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { orUndefined } from "@litespace/utils/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { IUser, Void } from "@litespace/types";
import ArrowRight from "@litespace/assets/ArrowRight";

export const ChatHeader: React.FC<{
  name: string | null;
  image: string | null;
  online: boolean | undefined;
  lastSeen: string;
  id: number;
  role: IUser.Role;
  inCall?: boolean;
  openDialog: Void;
  goBack: Void;
}> = ({
  name,
  image,
  online,
  id,
  lastSeen,
  role,
  openDialog,
  goBack,
  inCall,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="tw-flex tw-justify-between tw-px-6 tw-py-4 tw-shadow-chat-header">
      <div className="tw-flex tw-gap-2 lg:tw-gap-4 tw-items-center">
        <button
          onClick={goBack}
          className="tw-w-6 tw-h-6 lg:tw-hidden tw-cursor-pointer"
        >
          <ArrowRight />
        </button>
        <div
          className={cn(
            "tw-w-[42px] tw-h-[42px] lg:tw-w-[74px] lg:tw-h-[74px] tw-overflow-hidden tw-rounded-full",
            "tw-p-[9px] tw-flex tw-items-center tw-justify-center",
            online && "tw-border-4 tw-border-brand-700"
          )}
        >
          <div className="tw-rounded-full tw-overflow-hidden tw-w-8 tw-h-8 lg:tw-w-14 lg:tw-h-14 tw-shrink-0">
            <Avatar
              alt={orUndefined(name)}
              src={orUndefined(image)}
              seed={id.toString()}
            />
          </div>
        </div>
        <div>
          <Typography
            element={{ default: "body", lg: "subtitle-2" }}
            weight="bold"
            className={"tw-text-natural-950"}
          >
            {name}
          </Typography>
          <Typography
            element={{ default: "tiny-text", lg: "caption" }}
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
      {role !== IUser.Role.Student && !inCall ? (
        <div className="tw-flex tw-items-center">
          <Button onClick={openDialog} type="main" size="medium">
            {intl("chat.book")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ChatHeader;
