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
    <div className="tw-flex tw-justify-between tw-px-6 tw-py-4 tw-shadow-chat-header">
      <div className="tw-flex tw-grow tw-gap-2 lg:tw-gap-4 tw-items-center">
        <button
          type="button"
          onClick={back}
          className="tw-w-6 tw-h-6 tw-z-close-chat lg:tw-hidden tw-cursor-pointer"
        >
          <ArrowRightLong />
        </button>
        <div
          className={cn(
            "tw-flex tw-gap-2 tw-items-center",
            inSession ? "tw-hidden lg:tw-flex lg:tw-gap-2" : "lg:tw-gap-4"
          )}
        >
          <div
            className={cn(
              "tw-overflow-hidden tw-rounded-full",
              "tw-p-[2px] lg:tw-p-[5px] tw-flex tw-items-center tw-justify-center",
              "tw-border-[3px] lg:tw-border-4",
              online ? "tw-border-brand-700" : "tw-border-natural-500"
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
              tag="h4"
              className={cn(
                "tw-text-natural-950 tw-font-bold tw-text-body",
                inSession ? "lg:tw-text-body" : "lg:tw-text-subtitle-2"
              )}
            >
              {name}
            </Typography>
            <Typography
              tag="p"
              className={cn(
                "tw-text-tiny",
                inSession ? "lg:tw-text-tiny" : "lg:tw-text-caption",
                {
                  "tw-text-primary-700": online,
                  "tw-text-natural-700": !online,
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
              ? "tw-text-natural-950 lg:tw-hidden tw-text-body tw-font-bold"
              : "tw-hidden"
          )}
        >
          {intl("chat.in-session.header.title")}
        </Typography>
      </div>
      {role !== IUser.Role.Student && !inSession ? (
        <div className="tw-flex tw-items-center">
          <Button onClick={book} type="main" size="large">
            {intl("chat.book")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ChatHeader;
