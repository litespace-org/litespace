import React from "react";
import cn from "classnames";
import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { ChatMessage } from "@/components/Chat/ChatMessage";
import { motion } from "framer-motion";
import { orUndefined } from "@litespace/sol/utils";
import dayjs from "@/lib/dayjs";
import { useFormatMessage } from "@/hooks";

const messageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
} as const;
type MessageState = "seen" | "sent" | "pending" | undefined;

export const ChatMessageGroup: React.FC<{
  sender: { userId: number; name: string | null; image?: string | null };
  messages: Array<{ id: number; text: string; messageState?: MessageState }>;
  sentAt: string;
  owner?: boolean;
  editMessage: (message: { id: number; text: string }) => void;
  deleteMessage: (id: number) => void;
}> = ({
  sentAt,
  messages,
  sender: { image, name, userId },
  owner,
  editMessage,
  deleteMessage,
}) => {
  const intl = useFormatMessage();
  return (
    <div
      className={cn("tw-flex tw-gap-4", {
        "tw-flex-row-reverse": !owner,
        "tw-flex-row": owner,
      })}
    >
      <div className="tw-w-14 tw-h-14 tw-overflow-hidden tw-rounded-full tw-flex-shrink-0">
        <Avatar
          alt={orUndefined(name)}
          src={orUndefined(image)}
          seed={userId.toString()}
        />
      </div>
      <div>
        <div
          className={cn("tw-flex tw-gap-6 tw-mb-[14px] tw-items-center", {
            "tw-flex-row-reverse": !owner,
            "tw-flex-row": owner,
          })}
        >
          <Typography
            element="body"
            className="tw-font-semibold tw-text-natural-950 dark:tw-text-natural-50"
          >
            {owner ? intl("chat.message.title.you") : name}
          </Typography>
          <Typography
            element="tiny-text"
            className="tw-text-natural-400 dark:tw-text-natural-300"
          >
            {dayjs(sentAt).format("hh:mm a")}
          </Typography>
        </div>
        <div
          className={cn("tw-flex tw-flex-col tw-gap-y-2", {
            "tw-items-end": !owner,
            "tw-items-start": owner,
          })}
        >
          {messages.map((message, index) => (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn("w-full mt-1 tw-flex", {
                "tw-justify-end": !owner,
                "tw-justify-start": owner,
              })}
              key={message.id}
            >
              <ChatMessage
                firstMessage={index === 0}
                message={message}
                pending={message.messageState === "pending"}
                owner={owner}
                editMessage={() => editMessage(message)}
                deleteMessage={() => deleteMessage(message.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
