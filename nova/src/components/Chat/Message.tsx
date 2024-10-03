import {
  ActionsMenu,
  MenuAction,
  RawHtml,
  useFormatMessage,
  useRender,
} from "@litespace/luna";
import { IMessage, Void } from "@litespace/types";
import cn from "classnames";
import React, { useCallback, useMemo, useRef, useState } from "react";

const Message: React.FC<{
  message: IMessage.Self;
  onUpdateMessage: Void;
  onDeleteMessage: Void;
}> = ({ message, onUpdateMessage, onDeleteMessage }) => {
  const ref = useRef<HTMLDivElement>(null);
  const intl = useFormatMessage();
  const menu = useRender();
  const [open, setOpen] = useState<boolean>(false);

  const actions = useMemo((): MenuAction[] => {
    return [
      {
        id: 1,
        label: intl("chat.message.edit"),
        onClick: onUpdateMessage,
      },
      {
        id: 2,
        label: intl("chat.message.delete"),
        onClick: onDeleteMessage,
        danger: true,
      },
    ];
  }, [intl, onDeleteMessage, onUpdateMessage]);

  const hide = useCallback(() => {
    // hide the actions menu incase it is not opened.
    if (!open) menu.hide();
  }, [menu, open]);

  const onToggle = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={menu.show}
      onMouseLeave={hide}
    >
      <div className="max-w-screen-sm">
        <RawHtml html={message.text} />
      </div>
      <div
        data-open={menu.open}
        className={cn(
          "absolute top-0 left-0 -translate-y-[20%]",
          "hidden data-[open=true]:block"
        )}
      >
        <ActionsMenu actions={actions} onToggle={onToggle} />
      </div>
    </div>
  );
};

export default Message;
