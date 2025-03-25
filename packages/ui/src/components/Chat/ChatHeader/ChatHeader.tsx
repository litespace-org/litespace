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
import ArrowRight from "@litespace/assets/ArrowRight";

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
    <div
      className={cn(
        "flex justify-between shadow-chat-header",
        inSession ? "py-6 px-4 md:p-4" : "px-6 py-4"
      )}
    >
      <div className="flex grow gap-2 md:gap-6 lg:gap-4 items-center">
        <button
          type="button"
          onClick={back}
          className="w-6 h-6 lg:hidden cursor-pointer"
        >
          <ArrowRightLong className="md:hidden" />
          <ArrowRight className="hidden md:block [&_*]:stroke-brand-700 w-8 h-8" />
        </button>
        <div
          className={cn(
            inSession
              ? "hidden md:flex md:gap-4 lg:gap-2 items-center"
              : "flex gap-2 items-center lg:gap-4"
          )}
        >
          <div
            className={cn(
              "overflow-hidden shrink-0 self-center rounded-full",
              "p-[2px] md:p-[5px] flex items-center justify-center",
              "border-[3px] md:border-4",
              online ? "border-brand-700" : "border-natural-500"
            )}
          >
            <div className="rounded-full overflow-hidden w-8 h-8 md:w-14 md:h-14 shrink-0">
              <Avatar
                alt={orUndefined(name)}
                src={orUndefined(image)}
                seed={id.toString()}
              />
            </div>
          </div>
          <div className="flex flex-col gap-[5px]">
            <Typography
              tag="h4"
              className={cn(
                "text-natural-950 font-bold text-body",
                inSession
                  ? "md:text-subtitle-2 lg:text-body"
                  : "lg:text-subtitle-2"
              )}
            >
              {name}
            </Typography>
            <Typography
              tag="p"
              className={cn(
                "text-tiny",
                inSession ? "md:text-caption lg:text-tiny" : "lg:text-caption",
                {
                  "text-primary-700": online,
                  "text-natural-700": !online,
                }
              )}
            >
              {online
                ? intl("chat.online")
                : intl("chat.offline", { time: dayjs(lastSeen).fromNow() })}
            </Typography>
          </div>
        </div>
        <Typography
          tag="h4"
          className={cn(
            inSession
              ? "text-natural-950 md:hidden text-body font-bold"
              : "hidden"
          )}
        >
          {intl("chat.in-session.header.title")}
        </Typography>
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
