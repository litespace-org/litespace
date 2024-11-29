import React from "react";
import cn from "classnames";
import { Avatar } from "@/components/Avatar";
import { Void } from "@litespace/types";
import { Typography } from "@/components/Typography";
import { ChatMessage } from "@/components/Chat/ChatMessage";
import { motion } from "framer-motion";

const messageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
} as const;

export const ChatMessageGroup: React.FC<{
  userId: number;
  name: string;
  messages: Array<{ id: number; text: string }>;
  image?: string;
  sentAt: string;
  owner?: boolean;
  editMessage?: Void;
  deleteMessage?: Void;
}> = ({
  sentAt,
  image,
  messages,
  name,
  userId,
  owner,
  editMessage,
  deleteMessage,
}) => {
  return (
    <div
      className={cn("tw-flex tw-gap-4", {
        "tw-flex-row-reverse": !owner,
        "tw-flex-row": owner,
      })}
    >
      <div className="tw-w-14 tw-h-14 tw-overflow-hidden tw-rounded-full tw-flex-shrink-0">
        <Avatar alt={name} src={image} seed={userId.toString()} />
      </div>
      <div>
        <p
          className={cn("tw-flex tw-gap-6 tw-mb-[14px] tw-items-center", {
            "tw-flex-row-reverse": !owner,
            "tw-flex-row": owner,
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
            "tw-items-end": !owner,
            "tw-items-start": owner,
          })}
        >
          {messages.map((message) => (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full mt-1"
              key={message.id}
            >
              <ChatMessage
                text={message.text}
                owner={owner}
                editMessage={editMessage}
                deleteMessage={deleteMessage}
              />{" "}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
