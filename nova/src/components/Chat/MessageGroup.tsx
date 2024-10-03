import React from "react";
import cn from "classnames";
import dayjs from "@/lib/dayjs";
import { asFullAssetUrl } from "@/lib/atlas";
import { MessageGroup as IMessageGroup } from "@litespace/luna";
import Message from "@/components/Chat/Message";
import { IMessage } from "@litespace/types";
import { AnimatePresence, motion } from "framer-motion";

const messageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
} as const;

const MessageGroup: React.FC<{
  group: IMessageGroup;
  onUpdateMessage: (message: IMessage.Self) => void;
  onDeleteMessage: (message: IMessage.Self) => void;
}> = ({
  group: { sender, messages, date },
  onUpdateMessage,
  onDeleteMessage,
}) => {
  return (
    <li className={cn("flex flex-row gap-2 @container")}>
      <div className="w-8 h-8 @sm:w-10 @sm:h-10 @md:w-12 @md:h-12  overflow-hidden rounded-full shrink-0">
        <img
          className="object-cover w-full h-full"
          src={sender.photo ? asFullAssetUrl(sender.photo) : "/avatar-1.png"}
        />
      </div>
      <div className="w-full">
        <div className="flex flex-row gap-2 items-center">
          <p className="font-bold text-foreground text-xs @sm:text-[14px] @md:text-base">
            {sender.name}
          </p>
          <p className="text-foreground-muted dark:text-foreground-light text-xs @sm:text-[14px] @md:text-base leading-none">
            &mdash; &nbsp;
            {dayjs(date).fromNow()}
          </p>
        </div>

        <AnimatePresence>
          <motion.div className="text-foreground mt-1.5">
            {messages.map((message) => {
              return (
                <motion.div
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="mt-1 w-full"
                  key={message.id}
                >
                  <Message
                    message={message}
                    onUpdateMessage={() => onUpdateMessage(message)}
                    onDeleteMessage={() => onDeleteMessage(message)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </li>
  );
};

export default MessageGroup;
