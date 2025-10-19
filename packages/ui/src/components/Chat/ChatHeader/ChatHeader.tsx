import React from "react";
import { AvatarV2 } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { IUser, Void } from "@litespace/types";
import RightArrowHead from "@litespace/assets/RightArrowHead";
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
  className?: string;
}> = ({
  name,
  image,
  online,
  id,
  lastSeen,
  role,
  book,
  back,
  inSession,
  className,
}) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "flex justify-between rounded-t-2xl",
        inSession
          ? "py-6 px-4 sm:p-4 shadow-chat-header lg:shadow-transparent"
          : "shadow-chat-header px-6 py-4",
        className
      )}
    >
      <div
        className={cn(
          "flex grow items-center",
          inSession ? "gap-2 sm:gap-6" : "gap-2"
        )}
      >
        <button
          type="button"
          onClick={back}
          className={"lg:hidden cursor-pointer w-6 h-6 sm:w-8 sm:h-8"}
        >
          <RightArrowHead className="hidden sm:block w-full h-full [&>*]:stroke-brand-700" />
          <ArrowRight className="block sm:hidden w-full h-full [&>*]:stroke-natural-950" />
        </button>
        <div
          className={cn(
            "flex gap-2 items-center",
            inSession ? "hidden sm:flex sm:gap-4 lg:gap-2" : "lg:gap-4"
          )}
        >
          <div
            className={cn(
              "overflow-hidden rounded-full",
              "p-[2px] sm:p-[5px] flex items-center justify-center",
              "border-[3px] sm:border-4",
              online ? "border-brand-700" : "border-natural-500"
            )}
          >
            <div className="rounded-full overflow-hidden w-14 h-14 shrink-0">
              <AvatarV2 alt={name} src={image} id={id} />
            </div>
          </div>
          <div className="flex flex-col gap-[5px]">
            <Typography
              tag="h4"
              className={cn(
                "text-natural-950 font-bold text-body",
                inSession
                  ? "sm:text-subtitle-2 lg:text-body"
                  : "lg:text-subtitle-2"
              )}
            >
              {name}
            </Typography>
            <Typography
              tag="p"
              className={cn(
                "text-tiny",
                inSession ? "sm:text-caption lg:text-tiny" : "lg:text-caption",
                {
                  "text-primary-700": online,
                  "text-natural-700": !online,
                }
              )}
            >
              {online
                ? intl("chat.online")
                : lastSeen
                  ? intl("chat.offline", { time: dayjs(lastSeen).fromNow() })
                  : ""}
            </Typography>
          </div>
        </div>
        <Typography
          tag="h4"
          className={cn(
            inSession
              ? "text-natural-950 sm:hidden text-body font-bold"
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
