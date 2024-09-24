import React from "react";
import cn from "classnames";
import dayjs from "@/lib/dayjs";
import { RawHtml } from "@litespace/luna";
import { asFullAssetUrl } from "@/lib/atlas";
import { MessageGroup } from "@litespace/luna";

const Message: React.FC<{
  group: MessageGroup;
}> = ({ group: { sender, messages, date } }) => {
  return (
    <li className={cn("flex flex-row gap-2")}>
      <div className="w-10 h-10 md:w-14 md:h-14 overflow-hidden rounded-full">
        <img
          className="object-cover w-full h-full"
          src={sender.photo ? asFullAssetUrl(sender.photo) : "/avatar-1.png"}
        />
      </div>
      <div>
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
              <div className="mt-1" key={message.id}>
                <RawHtml html={message.text} />
              </div>
            );
          })}
        </div>
      </div>
    </li>
  );
};

export default Message;
