import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import cn from "classnames";
import More from "@litespace/assets/More";
import Paperclip from "@litespace/assets/Paperclip";
import Notification from "@litespace/assets/Notification";
import Edit from "@litespace/assets/Edit";
import Muted from "@litespace/assets/Muted";
import SingleCheck from "@litespace/assets/SingleCheck";
import DoubleCheck from "@litespace/assets/DoubleCheck";
import { Avatar } from "@/components/Avatar";
import { IMessage, Void } from "@litespace/types";
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
  owner?: boolean;
  online?: boolean;
  optionsEnabled?: boolean;
  messageState?: IMessage.MessageState;
  isMuted?: boolean;
  select: Void;
  toggleMute: Void;
  togglePin: Void;
}> = ({
  userId,
  name,
  owner,
  online,
  optionsEnabled,
  messageState,
  image,
  message,
  isMuted,
  isPinned,
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
        icon: <Notification width={16} height={16} />,
        label: isMuted ? intl("chat.unmute") : intl("chat.mute"),
        onClick: toggleMute,
      },
    ],
    [intl, isMuted, isPinned, toggleMute, togglePin]
  );

  const ReadIcon = useMemo(() => {
    if (messageState === "seen")
      return <DoubleCheck className="[&>*]:tw-fill-secondary-400" />;
    return <SingleCheck />;
  }, [messageState]);

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
      <div className="tw-w-14 tw-h-14 tw-relative tw-rounded-full tw-shrink-0">
        <div className="tw-overflow-hidden tw-rounded-full tw-relative tw-w-full tw-h-full">
          <Avatar src={image} alt={name} seed={userId.toString()} />
        </div>
        {online && !isActive ? (
          <div className="tw-absolute tw-bottom-0 tw-right-1 tw-z-online-indicator tw-w-3 tw-h-3 tw-rounded-full tw-bg-brand-500 tw-border-[.5px] tw-border-natural-50 " />
        ) : null}
      </div>
      <div className="tw-text-right tw-grow">
        <Typography
          className={cn(
            {
              "tw-text-natural-50 dark:tw-text-secondary-50": isActive,
              "tw-text-natural-950 dark:tw-text-natural-50": !isActive,
            },
            "tw-flex tw-gap-2 tw-items-center"
          )}
          weight="bold"
          element="body"
        >
          {name}
          {isMuted ? (
            <Muted className={cn(isActive && "[&>*]:tw-fill-natural-50")} />
          ) : null}
        </Typography>
        <Typography
          tag="div"
          element="caption"
          className={cn("tw-mt-2 tw-text-right tw-flex tw-gap-1", {
            "tw-text-natural-50 dark:tw-text-secondary-50": isActive,
            "tw-text-natural-600": !isActive,
          })}
        >
          {owner && !isActive && !isTyping ? (
            <div className="tw-w-[21px] tw-h-[21px] tw-flex tw-items-center tw-justify-center">
              {ReadIcon}
            </div>
          ) : null}
          {isTyping ? (
            <div className="tw-flex tw-gap-2 tw-items-center">
              <Edit
                width={16}
                height={16}
                className={cn({
                  "[&>*]:tw-stroke-brand-700 dark:[&>*]:tw-stroke-brand-400":
                    !isActive,
                  "[&>*]:tw-stroke-natural-50 dark:[&>*]:tw-stroke-secondary-50":
                    isActive,
                })}
              />
              <Typography
                element="caption"
                className={cn(
                  isActive ? "tw-text-natural-50" : "tw-text-brand-700"
                )}
              >
                {intl("chat.typing-now.male")}
              </Typography>
            </div>
          ) : (
            <span
              style={{ lineBreak: "anywhere" }}
              className="tw-line-clamp-1 "
            >
              {message}
            </span>
          )}
        </Typography>
      </div>
      <div className="tw-flex tw-w-fit tw-flex-col tw-relative tw-items-end tw-justify-between">
        {optionsEnabled ? (
          <Menu actions={actions}>
            <div className="tw-py-2 -tw-mt-2">
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
        ) : null}

        {unreadCount > 0 && !isActive ? (
          <Typography
            element="caption"
            weight="semibold"
            className={cn(
              "tw-w-[30px] tw-h-[30px] tw-flex tw-justify-center tw-items-center tw-rounded-full",
              "tw-text-natural-50 tw-bg-brand-700 tw-shadow-unread-count",
              "dark:tw-bg-brand-400 dark:tw-text-secondary-900 dark:tw-shadow-unread-count-dark"
            )}
          >
            {unreadCount}
          </Typography>
        ) : null}
      </div>
    </div>
  );
};
