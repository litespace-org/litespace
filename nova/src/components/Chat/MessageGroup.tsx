import React from "react";
import cn from "classnames";
import dayjs from "@/lib/dayjs";
import { asFullAssetUrl } from "@/lib/atlas";
import { MessageGroup as IMessageGroup } from "@litespace/luna";
import Message from "@/components/Chat/Message";
import { IMessage } from "@litespace/types";

const MessageGroup: React.FC<{
  group: IMessageGroup;
  editMessage: (message: IMessage.Self) => void;
  deleteMessage: (message: IMessage.Self) => void;
}> = ({ group: { sender, messages, date }, editMessage, deleteMessage }) => {
  return (
    <li className={cn("flex flex-row gap-2")}>
      <div className="w-10 h-10 md:w-14 md:h-14 overflow-hidden rounded-full shrink-0">
        <img
          className="object-cover w-full h-full"
          src={sender.photo ? asFullAssetUrl(sender.photo) : "/avatar-1.png"}
        />
      </div>
      <div className="w-full">
        <div className="flex flex-row gap-2 items-center">
          <p className="font-bold text-foreground text-xs md:text-base">
            {sender.name}
          </p>{" "}
          &mdash;
          <p className="text-foreground-muted dark:text-foreground-light text-xs md:text-base leading-none">
            {dayjs(date).fromNow()}
          </p>
        </div>

        <div className="text-foreground mt-1.5">
          {messages.map((message) => {
            return (
              <div className="mt-1 w-full" key={message.id}>
                <Message
                  message={message}
                  editMessage={() => editMessage(message)}
                  deleteMessage={() => deleteMessage(message)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </li>
  );
};

export default MessageGroup;
