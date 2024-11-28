import { Void } from "@litespace/types";
import React from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";
import { ChatBubbleVariant } from "@/components/Chat/ChatBubble/types";
import More from "@litespace/assets/More";
import { Menu } from "@/components/Menu";
import { useFormatMessage } from "@/hooks";
import MessageEdit from "@litespace/assets/MessageEdit";
import Trash from "@litespace/assets/Trash";

export const ChatBubble: React.FC<{
  text: string;
  variant: ChatBubbleVariant;
  editMessage?: Void;
  deleteMessage?: Void;
}> = ({ text, variant, editMessage, deleteMessage }) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn(
        "tw-group tw-flex tw-w-fit",
        "tw-gap-[14px] tw-items-center",
        {
          "tw-flex-row-reverse": variant === ChatBubbleVariant.CurrentUser,
          "tw-flex-row": variant === ChatBubbleVariant.OtherUser,
        }
      )}
    >
      <div
        className={cn(
          "tw-opacity-0 group-hover:tw-opacity-100 tw-duration-150 tw-h-fit -tw-translate-y-1/2"
        )}
      >
        <Menu
          actions={[
            {
              label: intl("chat.message.edit"),
              onClick: editMessage,
              icon: <MessageEdit />,
            },
            {
              label: intl("chat.message.delete"),
              onClick: deleteMessage,
              icon: <Trash />,
            },
          ]}
        >
          <button className="tw-py-2 tw-flex tw-justify-center tw-items-center">
            <More className="[&>*]:tw-fill-natural-800 dark:[&>*]:tw-fill-natural-50" />
          </button>
        </Menu>
      </div>
      <div
        className={cn("tw-rounded-[15px] tw-relative tw-px-6 tw-py-3", {
          "tw-bg-brand-100 dark:tw-bg-brand-100":
            ChatBubbleVariant.OtherUser === variant,
          "tw-bg-brand-700 dark:tw-bg-brand-400":
            ChatBubbleVariant.CurrentUser === variant,
        })}
      >
        {variant === ChatBubbleVariant.OtherUser ? (
          <div
            className={cn(
              "tw-absolute -tw-top-[10px] tw-left-[0px] tw-w-0 tw-h-0",
              "tw-rounded-t-full tw-rounded-r-full",
              "tw-border-r-[40px]  tw-border-b-[22px]",
              "tw-border-r-transparent tw-border-b-brand-100 dark:tw-border-b-brand-100"
            )}
          />
        ) : (
          <div
            className={cn(
              "tw-absolute -tw-top-[10px] tw-right-[0px] tw-w-0 tw-h-0",
              "tw-rounded-t-full tw-rounded-l-full",
              "tw-border-l-[40px]  tw-border-b-[22px]",
              "tw-border-l-transparent tw-border-b-brand-700 dark:tw-border-b-brand-400"
            )}
          />
        )}
        <Typography
          element="caption"
          className={cn("tw-font-normal", {
            "tw-text-natural-950 dark:tw-text-secondary-900":
              variant === ChatBubbleVariant.OtherUser,
            "tw-text-natural-50 dark:tw-text-secondary-900":
              variant === ChatBubbleVariant.CurrentUser,
          })}
        >
          {text}
        </Typography>
      </div>
    </div>
  );
};
