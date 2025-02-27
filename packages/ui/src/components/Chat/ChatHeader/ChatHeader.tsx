import React from "react";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { orUndefined } from "@litespace/utils/utils";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { IUser, Void } from "@litespace/types";
import ArrowRightLong from "@litespace/assets/ArrowRightLong";

export const ChatHeader: React.FC<{
  name: string | null;
  image: string | null;
  online: boolean | undefined;
  /**
   * ISO UTC date.
   */
  lastSeen: string;
  id: number;
  role: IUser.Role;
  inSession?: boolean;
  book: Void;
  back: Void;
}> = ({ name, image, online, id, lastSeen, role, book, back, inSession }) => {
  const intl = useFormatMessage();

  return (
    <div className="flex justify-between px-6 py-4 shadow-chat-header">
      <div className="flex gap-2 lg:gap-4 items-center">
        <button
          type="button"
          onClick={back}
          className="w-6 h-6 lg:hidden cursor-pointer"
        >
          <ArrowRightLong />
        </button>
        <div
          className={cn(
            "overflow-hidden rounded-full",
            "p-[2px] lg:p-[5px] flex items-center justify-center",
            "border-[3px] lg:border-4",
            online ? "border-brand-700" : "border-natural-500"
          )}
        >
          <div className="rounded-full overflow-hidden w-8 h-8 lg:w-14 lg:h-14 shrink-0">
            <Avatar
              alt={orUndefined(name)}
              src={orUndefined(image)}
              seed={id.toString()}
            />
          </div>
        </div>
        <div>
          <Typography
            tag="span"
            className={"text-natural-950 text-subtitle-2 text-body"}
          >
            {name}
          </Typography>
          <Typography
            tag="span"
            className={cn("text-tiny lg:text-caption", {
              "text-primary-700": online,
              "text-natural-700": !online,
            })}
          >
            {online
              ? intl("chat.online")
              : intl("chat.offline", { time: dayjs(lastSeen).fromNow() })}
          </Typography>
        </div>
      </div>
      {role !== IUser.Role.Student && !inSession ? (
        <div className="flex items-center">
          <Button onClick={book} type="main" size="large">
            {intl("chat.book")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ChatHeader;
