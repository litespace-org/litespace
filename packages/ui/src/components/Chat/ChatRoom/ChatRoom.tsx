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
import { Avatar } from "@/components/Avatar";
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
      return <DoubleCheck className="[&>*]:tw-fill-secondary-400" />;
    return <SingleCheck />;
  }, [messageState]);

  return (
    <div
      onClick={select}
      className={cn(
        "tw-flex tw-gap-4 tw-items-stretch tw-group",
        "tw-rounded-lg tw-cursor-pointer",
        "tw-transition-colors tw-duration-300",
        {
          "hover:tw-bg-natural-100 dark:hover:tw-bg-secondary-900": !active,
          "tw-bg-brand-700 dark:tw-bg-secondary-500": active,
        }
      )}
    >
      <div className="tw-flex tw-gap-4 tw-flex-1 tw-py-2 tw-ps-2">
        <div className="tw-w-14 tw-h-14 tw-relative tw-rounded-full tw-shrink-0">
          <div className="tw-overflow-hidden tw-rounded-full tw-relative tw-w-full tw-h-full">
            <Avatar src={imageUrl} alt={name} seed={userId.toString()} />
          </div>
          {online && !active ? (
            <div className="tw-absolute tw-bottom-0 tw-right-1 tw-z-online-indicator tw-w-3 tw-h-3 tw-rounded-full tw-bg-brand-500 tw-border-[.5px] tw-border-natural-50 " />
          ) : null}
        </div>
        <div className="tw-text-right tw-grow">
          <Typography
            tag="label"
            className={cn(
              {
                "tw-text-natural-50 dark:tw-text-secondary-50": active,
                "tw-text-natural-950 dark:tw-text-natural-50": !active,
              },
              "tw-flex tw-gap-2 tw-items-center tw-text-body tw-font-bold"
            )}
          >
            {name}
            {muted ? (
              <Muted
                width={16}
                height={16}
                className={cn(
                  active &&
                    "[&_path]:tw-fill-natural-50 [&_path:last-child]:tw-stroke-transparent"
                )}
              />
            ) : null}
          </Typography>
          <Typography
            tag="div"
            className={cn("tw-mt-2 tw-text-right tw-flex tw-gap-1", {
              "tw-text-natural-50 dark:tw-text-secondary-50": active,
              "tw-text-natural-600": !active && actionable,
              "tw-text-brand-700": !active && !actionable,
              "tw-text-caption": actionable,
              "tw-text-tiny": !actionable,
            })}
          >
            {owner && !active && !typing ? (
              <div className="tw-w-[21px] tw-h-[21px] tw-flex tw-items-center tw-justify-center">
                {ReadIcon}
              </div>
            ) : null}
            {typing ? (
              <div className="tw-flex tw-gap-2 tw-items-center">
                <Edit
                  width={16}
                  height={16}
                  className={cn({
                    "[&>*]:tw-stroke-brand-700 dark:[&>*]:tw-stroke-brand-400":
                      !active,
                    "[&>*]:tw-stroke-natural-50 dark:[&>*]:tw-stroke-secondary-50":
                      active,
                  })}
                />
                <Typography
                  tag="label"
                  className={cn(
                    "tw-text-caption",
                    active ? "tw-text-natural-50" : "tw-text-brand-700"
                  )}
                >
                  {intl("chat.typing-now.male")}
                </Typography>
              </div>
            ) : (
              <span
                style={{ lineBreak: "anywhere" }}
                className="tw-line-clamp-1"
              >
                {message}
              </span>
            )}
          </Typography>
        </div>
      </div>
      <div className="tw-flex tw-w-fit tw-flex-col tw-relative tw-items-end tw-justify-between">
        {actionable ? (
          <Menu
            className="tw-translate-x-4 lg:tw-translate-x-4"
            actions={actions}
          >
            <div className="tw-p-2 ">
              <More
                className={cn(
                  "tw-cursor-pointer tw-w-6 tw-h-[5px] lg:tw-w-3 lg:tw-h-[3px]",
                  {
                    "[&>*]:tw-fill-natural-800 dark:[&>*]:tw-fill-natural-50":
                      !active,
                    "[&>*]:tw-fill-natural-50 dark:[&>*]:tw-fill-natural-50":
                      active,
                  }
                )}
              />
            </div>
          </Menu>
        ) : null}

        {unreadCount && !active ? (
          <Typography
            tag="label"
            className={cn(
              "tw-w-[30px] tw-h-[30px] tw-flex tw-justify-center tw-items-center tw-rounded-full",
              "tw-text-natural-50 tw-bg-brand-700 tw-shadow-unread-count",
              "dark:tw-bg-brand-400 dark:tw-text-secondary-900 dark:tw-shadow-unread-count-dark",
              "tw-me-2 tw-mb-2 tw-text-caption tw-font-semibold"
            )}
          >
            {unreadCount}
          </Typography>
        ) : null}
      </div>
    </div>
  );
};
