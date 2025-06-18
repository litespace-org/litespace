import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import cn from "classnames";
import More from "@litespace/assets/More";
import Pin from "@litespace/assets/Pin";
import Notification from "@litespace/assets/Notification";
import Edit from "@litespace/assets/Edit";
import Muted from "@litespace/assets/Muted";
import SingleCheck from "@litespace/assets/SingleCheck";
import DoubleCheck from "@litespace/assets/DoubleCheck";
import { AvatarV2 } from "@/components/Avatar";
import { IMessage, Void } from "@litespace/types";
import { Menu, type MenuAction } from "@/components/Menu";

export type Props = {
  userId: number;
  name?: string;
  imageUrl?: string;
  message: string;
  unreadCount: number;
  typing?: boolean;
  active?: boolean;
  pinned?: boolean;
  muted?: boolean;
  /**
   * `true` in case the current user is the owner of the latest room message.
   */
  owner?: boolean;
  online?: boolean;
  /**
   * whether we show menu or not.
   * false in case this was all tutors chatRoom
   */
  actionable?: boolean;
  messageState?: IMessage.MessageState;
  select: Void;
  toggleMute: Void;
  togglePin: Void;
};

export const ChatRoom: React.FC<Props> = ({
  userId,
  name,
  owner,
  online,
  actionable,
  messageState,
  imageUrl,
  message,
  muted,
  pinned,
  unreadCount,
  select,
  toggleMute,
  togglePin,
  typing,
  active,
}) => {
  const intl = useFormatMessage();

  const actions: MenuAction[] = useMemo(
    () => [
      {
        label: pinned ? intl("chat.unpin") : intl("chat.pin"),
        icon: <Pin />,
        onClick: togglePin,
      },
      {
        icon: <Notification width={16} height={16} />,
        label: muted ? intl("chat.unmute") : intl("chat.mute"),
        onClick: toggleMute,
      },
    ],
    [intl, muted, pinned, toggleMute, togglePin]
  );

  const ReadIcon = useMemo(() => {
    if (messageState === "seen")
      return <DoubleCheck className="[&>*]:fill-secondary-400" />;
    return <SingleCheck />;
  }, [messageState]);

  return (
    <div
      onClick={select}
      className={cn(
        "flex gap-4 items-stretch group",
        "rounded-lg cursor-pointer",
        "transition-colors duration-300",
        {
          "hover:bg-natural-100 dark:hover:bg-secondary-900": !active,
          "bg-brand-700 dark:bg-secondary-500": active,
        }
      )}
    >
      <div className="flex gap-4 flex-1 py-2 ps-2">
        <div className="w-14 h-14 relative rounded-full shrink-0">
          <div className="overflow-hidden rounded-full relative w-full h-full">
            <AvatarV2 src={imageUrl} alt={name} id={userId} />
          </div>
          {online && !active ? (
            <div className="absolute bottom-0 right-1 z-online-indicator w-3 h-3 rounded-full bg-brand-500 border-[.5px] border-natural-50 " />
          ) : null}
        </div>
        <div className="text-right grow">
          <Typography
            tag="span"
            className={cn(
              {
                "text-natural-50 dark:text-secondary-50": active,
                "text-natural-950 dark:text-natural-50": !active,
              },
              "flex gap-2 items-center text-body font-bold"
            )}
          >
            {name}
            {muted ? (
              <Muted
                width={16}
                height={16}
                className={cn(
                  active &&
                    "[&_path]:fill-natural-50 [&_path:last-child]:stroke-transparent"
                )}
              />
            ) : null}
          </Typography>
          <Typography
            tag="span"
            className={cn("mt-2 text-right flex gap-1", {
              "text-natural-50 dark:text-secondary-50": active,
              "text-natural-600": !active && actionable,
              "text-brand-700": !active && !actionable,
              "text-caption": actionable,
              "text-tiny": !actionable,
            })}
          >
            {owner && !active && !typing ? (
              <div className="w-[21px] h-[21px] flex items-center justify-center">
                {ReadIcon}
              </div>
            ) : null}
            {typing ? (
              <div className="flex gap-2 items-center">
                <Edit
                  width={16}
                  height={16}
                  className={cn({
                    "[&>*]:stroke-brand-700 dark:[&>*]:stroke-brand-400":
                      !active,
                    "[&>*]:stroke-natural-50 dark:[&>*]:stroke-secondary-50":
                      active,
                  })}
                />
                <Typography
                  tag="span"
                  className={cn(
                    "text-caption",
                    active ? "text-natural-50" : "text-brand-700"
                  )}
                >
                  {intl("chat.typing-now.male")}
                </Typography>
              </div>
            ) : (
              <span style={{ lineBreak: "anywhere" }} className="line-clamp-1">
                {message}
              </span>
            )}
          </Typography>
        </div>
      </div>
      <div className="flex w-fit flex-col relative items-end justify-between">
        {actionable ? (
          <Menu className="translate-x-4 lg:translate-x-4" actions={actions}>
            <div className="p-2 ">
              <More
                className={cn("cursor-pointer w-4 h-1", {
                  "[&>*]:fill-natural-800 dark:[&>*]:fill-natural-50": !active,
                  "[&>*]:fill-natural-50 dark:[&>*]:fill-natural-50": active,
                })}
              />
            </div>
          </Menu>
        ) : null}

        {unreadCount && !active ? (
          <Typography
            tag="span"
            className={cn(
              "w-[30px] h-[30px] flex justify-center items-center rounded-full",
              "text-natural-50 bg-brand-700 shadow-unread-count",
              "dark:bg-brand-400 dark:text-secondary-900 dark:shadow-unread-count-dark",
              "me-2 mb-2 text-caption font-semibold"
            )}
          >
            {unreadCount}
          </Typography>
        ) : null}
      </div>
    </div>
  );
};
