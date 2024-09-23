import React from "react";
import cn from "classnames";
import { IMessage } from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { RawHtml } from "@litespace/luna";

const Message: React.FC<{
  message: IMessage.Self;
  owner: boolean;
  ownPrev: boolean;
  ownNext: boolean;
}> = ({ message, owner, ownPrev, ownNext }) => {
  return (
    <li
      className={cn(
        "pr-4 pl-6 py-2 w-fit min-w-[200px] border",
        "transition-colors duration-200 rounded-l-3xl",
        owner
          ? "bg-brand-button border-brand/30 hover:border-brand"
          : "bg-selection border-border-strong hover:border-border-stronger",
        {
          "mt-1": ownPrev,
          "rounded-l-3xl rounded-tr-xl": ownPrev && !ownNext,
          "rounded-r-xl": ownNext && ownPrev,
          "rounded-r-3xl rounded-br-xl mt-4": ownNext && !ownPrev,
          "mt-4 rounded-tr-3xl": !ownNext && !ownPrev,
        }
      )}
    >
      <div className="mb-1">
        <RawHtml html={message.text} />
      </div>
      <span
        className={cn(
          "text-xs",
          owner ? "text-foreground-light" : "text-foreground-lighter"
        )}
      >
        {dayjs(message.createdAt).format("HH:mm a")}
      </span>
    </li>
  );
};

export default Message;
