import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import cn from "classnames";
import More from "@litespace/assets/More";
import Paperclip from "@litespace/assets/Paperclip";
import Notification from "@litespace/assets/Notification";
import Edit from "@litespace/assets/Edit";
import { Avatar } from "@/components/Avatar";
import { Void } from "@litespace/types";
import { Menu, type MenuAction } from "@/components/Menu";

export const ChatRoom: React.FC<{
  userId: number;
  name: string;
  image?: string;
  message: string;
  unreadCount: number;
  isTyping?: boolean;
  isActive?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  select: Void;
  toggleMute: Void;
  togglePin: Void;
}> = ({
  userId,
  isPinned,
  isMuted,
  name,
  image,
  message,
  unreadCount,
  select,
  toggleMute,
  togglePin,
  isTyping,
  isActive,
}) => {
  const intl = useFormatMessage();

  const actions: MenuAction[] = useMemo(
    () => [
      {
        label: isPinned ? intl("chat.unpin") : intl("chat.pin"),
        icon: <Paperclip />,
        onClick: togglePin,
      },
      {
        icon: <Notification />,
        label: isMuted ? intl("chat.unmute") : intl("chat.mute"),
        onClick: toggleMute,
      },
    ],
    [intl, isMuted, isPinned, toggleMute, togglePin]
  );

  return (
    <div
      onClick={select}
      className={cn(
        "tw-flex tw-gap-4 tw-items-stretch tw-group",
        "tw-p-2 tw-rounded-lg tw-cursor-pointer",
        "tw-transition-colors tw-duration-300",
        {
          "hover:tw-bg-natural-100 dark:hover:tw-bg-secondary-900": !isActive,
          "tw-bg-brand-700 dark:tw-bg-secondary-500": isActive,
        }
      )}
    >
      <div className="tw-w-14 tw-h-14 tw-rounded-full tw-overflow-hidden">
        <Avatar src={image} alt={name} seed={userId.toString()} />
      </div>
      <div className="tw-text-right tw-grow">
        <Typography
          className={cn({
            "tw-text-natural-50 dark:tw-text-secondary-50": isActive,
            "tw-text-natural-950 dark:tw-text-natural-50": !isActive,
          })}
          weight="bold"
          element="body"
        >
          {name}
        </Typography>
        <Typography
          tag="div"
          element="caption"
          className={cn("tw-line-clamp-1 tw-mt-2 tw-text-right", {
            "tw-text-natural-50 dark:tw-text-secondary-50": isActive,
            "tw-text-brand-700 dark:tw-text-brand-400": !isActive,
          })}
        >
          {isTyping ? (
            <div className={"tw-flex tw-gap-2 tw-items-center"}>
              <Edit
                className={cn({
                  "[&>*]:tw-stroke-brand-700 dark:[&>*]:tw-stroke-brand-400":
                    !isActive,
                  "[&>*]:tw-stroke-natural-50 dark:[&>*]:tw-stroke-secondary-50":
                    isActive || isTyping,
                })}
              />
              {intl("chat.Typing-now")}
            </div>
          ) : (
            message
          )}
        </Typography>
      </div>
      <div className="tw-flex tw-w-fit tw-flex-col tw-relative tw-items-end tw-justify-between">
        <Menu actions={actions}>
          <div className="tw-p-2 -tw-m-2">
            <More
              className={cn("tw-cursor-pointer", {
                "[&>*]:tw-fill-natural-800 dark:[&>*]:tw-fill-natural-50":
                  !isActive,
                "[&>*]:tw-fill-natural-50 dark:[&>*]:tw-fill-natural-50":
                  isActive,
              })}
            />
          </div>
        </Menu>

        {unreadCount > 0 && !isActive ? (
          <div
            className={cn(
              "tw-w-[30px] tw-h-[30px] tw-flex tw-justify-center tw-items-center tw-rounded-full",
              "tw-font-semibold tw-text-sm",
              "tw-text-natural-50 tw-bg-brand-700 tw-shadow-unread-count",
              "dark:tw-bg-brand-400 dark:tw-text-secondary-900 dark:tw-shadow-unread-count-dark"
            )}
          >
            {unreadCount}
          </div>
        ) : null}
      </div>
    </div>
  );
};
