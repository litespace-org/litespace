import React from "react";
import EditMessageIcon from "@litespace/assets/EditMessage";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { ChatMessage, SendInput } from "@/components/Chat";
import { Dialog } from "@/components/Dialog";
import { Void } from "@litespace/types";

export const EditMessage: React.FC<{
  open: boolean;
  close: Void;
  message: { id: number; text: string };
  onUpdateMessage: (value: string) => void;
}> = ({ open, close, message, onUpdateMessage }) => {
  const intl = useFormatMessage();
  return (
    <Dialog
      className="w-[770px]"
      open={open}
      close={close}
      title={
        <div className="flex items-center justify-center gap-2">
          <EditMessageIcon className="[&>*]:stroke-natural-950" />
          <Typography
            tag="span"
            className="font-bold text-natural-950 text-subtitle-2"
          >
            {intl("chat.message.edit")}
          </Typography>
        </div>
      }
      description="Edit chat message"
    >
      <div className="my-14">
        <ChatMessage message={message} owner viewOnly />
      </div>
      <SendInput initialMessage={message} onSubmit={onUpdateMessage} />
    </Dialog>
  );
};

export default EditMessage;
