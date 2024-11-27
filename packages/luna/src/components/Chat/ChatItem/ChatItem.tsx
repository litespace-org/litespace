import React, { useMemo } from "react";
import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import { asFullAssetUrl } from "@/lib";
import cn from "classnames";
import More from "@litespace/assets/More";
import Paperclip from "@litespace/assets/Paperclip";
import Trash from "@litespace/assets/Trash";
import Notification from "@litespace/assets/Notification";
import Edit from "@litespace/assets/Edit";
import { Avatar } from "@/components/Avatar";
import { ActionsMenu } from "@/components/ActionsMenu";

export const ChatItem: React.FC<{
  name: string;
  chatId: number;
  image: string;
  message: string;
  unreadCount: number;
  isTyping?: boolean;
  isActive?: boolean;
  onPin: (chatId: number) => void;
  onMute: (chatId: number) => void;
  onDelete: (chatId: number) => void;
}> = ({
  name,
  chatId,
  image,
  message,
  unreadCount,
  isTyping,
  isActive,
  onDelete,
  onPin,
  onMute,
}) => {
  const intl = useFormatMessage();

  const actions = useMemo(
    () => [
      {
        id: 1,
        label: (
          <button
            onClick={() => onPin(chatId)}
            className="tw-flex tw-gap-1 tw-items-center tw-text-natural-600 tw-text-xs tw-justify-start tw-font-semibold"
          >
            <Paperclip />
            {intl("chat.pin")}
          </button>
        ),
      },
      {
        id: 2,
        label: (
          <button
            onClick={() => onMute(chatId)}
            className="tw-flex tw-gap-1 tw-items-center tw-text-natural-600 tw-text-xs tw-justify-start tw-font-semibold"
          >
            <Notification />
            {intl("chat.mute")}
          </button>
        ),
      },
      {
        id: 3,
        label: (
          <button
            onClick={() => onDelete(chatId)}
            className="tw-flex tw-gap-1 tw-items-center tw-text-natural-600 tw-text-xs tw-justify-start tw-font-semibold"
          >
            <Trash />
            {intl("chat.delete-chat")}
          </button>
        ),
      },
    ],
    [intl, onDelete, onMute, onPin, chatId]
  );

  return (
    <div
      className={cn(
        "tw-flex tw-gap-4 tw-items-stretch tw-group",
        "tw-max-w-[352px] tw-p-2 tw-rounded-lg tw-cursor-pointer",
        "tw-duration-300",
        {
          "hover:tw-bg-natural-100 dark:hover:tw-bg-secondary-900": !isActive,
          "tw-bg-brand-700 dark:tw-bg-secondary-500": isActive,
        }
      )}
    >
      <div className="tw-rounded-full">
        <Avatar src={asFullAssetUrl(image)} />
      </div>
      <div className="tw-text-right tw-grow">
        <Typography
          className={cn("tw-font-bold", {
            "tw-text-natural-50 dark:tw-text-secondary-50": isActive,
            "tw-text-natural-950 dark:tw-text-natural-50": !isActive,
          })}
          tag={"h3"}
        >
          {name}
        </Typography>
        <Typography
          tag={"caption"}
          className={cn("tw-line-clamp-1 tw-mt-2 tw-text-sm tw-text-right", {
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
                  "[&>*]tw-stroke-natural-50 dark:[&>*]:tw-stroke-secondary-50":
                    isActive,
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
        <ActionsMenu
          actions={actions}
          menuClassName="tw-w-[125px] tw-p-2 tw-border tw-border-natural-200 tw-shadow-chat-menu tw-bg-natural-50"
        >
          <button>
            <More
              className={cn("tw-cursor-pointer", {
                "[&>*]:tw-fill-natural-800 dark:[&>*]:tw-fill-natural-50":
                  !isActive,
                "[&>*]:tw-fill-natural-50 dark:[&>*]:tw-fill-natural-50":
                  isActive,
              })}
            />
          </button>
        </ActionsMenu>
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
