import React from "react";
import cn from "classnames";
import { Avatar } from "@/components/Avatar";
import { Typography } from "@/components/Typography";
import { ChatMessage } from "@/components/Chat/ChatMessage";
import { motion } from "framer-motion";
import { orUndefined } from "@litespace/utils/utils";
import dayjs from "@/lib/dayjs";
import { useFormatMessage } from "@/hooks";
import { DisplayMessage } from "@/lib/chat";
import { InView } from "react-intersection-observer";

const messageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
} as const;

export type RetryFnMap = Record<
  "send" | "update" | "delete",
  (
    payload:
      | { roomId: number; text: string; userId: number }
      | {
          id: number;
          text: string;
          roomId: number;
        }
      | number
  ) => void
>;
type ErrorType = "send" | "update" | "delete";
type RoomErrors = Record<string | number, ErrorType>;

export const ChatMessageGroup: React.FC<{
  sender: { userId: number; name: string | null; image?: string | null };
  messages: DisplayMessage[];
  roomId: number;
  sentAt: string;
  owner?: boolean;
  retryFnMap: RetryFnMap;
  roomErrors: RoomErrors;
  readMessage: (id: number) => void;
  editMessage: (message: { id: number; text: string }) => void;
  deleteMessage: (id: number) => void;
}> = ({
  sentAt,
  retryFnMap,
  roomId,
  roomErrors,
  messages,
  sender: { image, name, userId },
  owner,
  readMessage,
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
      <div className="tw-hidden lg:tw-block tw-w-14 tw-h-14 tw-overflow-hidden tw-rounded-full tw-flex-shrink-0">
        <Avatar
          alt={orUndefined(name)}
          src={orUndefined(image)}
          seed={userId.toString()}
        />
      </div>
      <div>
        <div
          className={cn("tw-hidden lg:tw-flex tw-gap-6 tw-items-center", {
            "tw-flex-row-reverse": !owner,
            "tw-flex-row": owner,
          })}
        >
          <Typography
            tag="span"
            className="tw-font-semibold tw-text-natural-950 dark:tw-text-natural-50 tw-text-body"
          >
            {owner ? intl("chat.message.title.you") : name}
          </Typography>
          <Typography
            tag="span"
            className="tw-text-natural-400 dark:tw-text-natural-300 tw-text-tiny"
          >
            {dayjs(sentAt).format("hh:mm a")}
          </Typography>
        </div>
        <div
          className={cn("tw-flex tw-flex-col lg:tw-mt-2 tw-gap-y-2", {
            "tw-items-end": !owner,
            "tw-items-start": owner,
          })}
        >
          {messages.map((message, index) => {
            const retry = () => {
              const messageErrorType = roomErrors[message.id];
              if (!messageErrorType) return null;

              if (messageErrorType === "update")
                return retryFnMap[messageErrorType]({
                  id: message.id,
                  roomId,
                  text: message.text,
                });

              if (messageErrorType === "delete")
                return retryFnMap[messageErrorType](message.id);

              return retryFnMap[messageErrorType]({
                roomId,
                text: message.text,
                userId,
              });
            };

            return message.deleted ? null : (
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
                <InView
                  as="div"
                  onChange={() =>
                    !owner &&
                    message.messageState !== "seen" &&
                    readMessage(message.id)
                  }
                >
                  <ChatMessage
                    messageState={message.messageState}
                    firstMessage={index === 0}
                    message={message}
                    pending={message.messageState === "pending"}
                    error={message.messageState === "error"}
                    owner={owner}
                    retry={retry}
                    editMessage={() => editMessage(message)}
                    deleteMessage={() => deleteMessage(message.id)}
                  />
                </InView>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
