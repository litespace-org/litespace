import React from "react";
import cn from "classnames";
import { Avatar } from "@/components/Avatar";
import { IMessage, Void } from "@litespace/types";
import { Typography } from "@/components/Typography";
import { ChatBubble, ChatBubbleVariant } from "@/components/Chat/ChatBubble";

export const ChatGroup: React.FC<{
  userId: number;
  name: string;
  messages: IMessage.Self[];
  image?: string;
  sentAt: string;
  variant: ChatBubbleVariant;
  editMessage?: Void;
  deleteMessage?: Void;
}> = ({
  sentAt,
  image,
  messages,
  name,
  userId,
  variant,
  editMessage,
  deleteMessage,
}) => {
  return (
    <div
      className={cn("tw-flex tw-gap-4", {
        "tw-flex-row-reverse": variant === ChatBubbleVariant.OtherUser,
        "tw-flex-row": variant === ChatBubbleVariant.OtherUser,
      })}
    >
      <div className="tw-w-14 tw-h-14 tw-overflow-hidden tw-rounded-full">
        <Avatar alt={name} src={image} seed={userId.toString()} />
      </div>
      <div>
        <p
          className={cn("tw-flex tw-gap-6 tw-mb-[14px] tw-items-center", {
            "tw-flex-row-reverse": variant === ChatBubbleVariant.OtherUser,
            "tw-flex-row": variant === ChatBubbleVariant.OtherUser,
          })}
        >
          <Typography
            element="body"
            className="tw-font-semibold tw-text-natural-950 dark:tw-text-natural-50"
          >
            {name}
          </Typography>
          <Typography
            element="tiny-text"
            className="tw-text-natural-400 dark:tw-text-natural-300"
          >
            {sentAt}
          </Typography>
        </p>
        <div
          className={cn("tw-flex tw-flex-col tw-gap-y-4", {
            "tw-items-end": variant === ChatBubbleVariant.OtherUser,
            "tw-items-start": variant === ChatBubbleVariant.CurrentUser,
          })}
        >
          {messages.map((message) => (
            <ChatBubble
              text={message.text}
              variant={variant}
              editMessage={editMessage}
              deleteMessage={deleteMessage}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
