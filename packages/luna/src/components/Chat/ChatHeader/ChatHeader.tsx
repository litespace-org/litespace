import React from "react";
import { Avatar } from "@/components/Avatar";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { useFormatMessage } from "@/hooks";
export const ChatHeader: React.FC<{
  name: string | null;
  image: string | null;
  online: boolean;
  lastSeen: string;
  id: number;
}> = ({ name, image, online, id, lastSeen }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-justify-between">
      <div className="tw-flex tw-gap-4 tw-items-center">
        <div
          className={cn(
            "tw-w-[74px] tw-h-[74px] tw-overflow-hidden tw-rounded-full",
            "tw-py-[9px] tw-px-[7px] tw-flex tw-items-center tw-justify-center",
            online && "tw-border-4 tw-border-brand-700"
          )}
        >
          <div className="tw-rounded-full tw-overflow-hidden tw-w-14 tw-h-14">
            <Avatar alt={name || ""} src={image || ""} seed={id.toString()} />
          </div>
        </div>
        <div>
          <Typography
            element="subtitle-2"
            className={"tw-font-bold tw-text-natural-950 "}
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
              : intl("chat.offline", { time: lastSeen })}
          </Typography>
        </div>
      </div>
      <div className="tw-flex tw-items-center">
        <Button type={ButtonType.Main} size={ButtonSize.Large}>
          {intl("chat.book")}
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
