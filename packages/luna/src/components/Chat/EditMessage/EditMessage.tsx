import React from "react";
import EditMessageIcon from "@litespace/assets/EditMessage";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { ChatMessage, SendInput } from "@/components/Chat";
import { Dialog } from "@/components/Dialog/V2";
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
      className="tw-w-[770px]"
      open={open}
      close={close}
      title={
        <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
          <EditMessageIcon className="[&>*]:tw-stroke-natural-950" />
          <Typography
            element="subtitle-2"
            className="tw-font-bold tw-text-natural-950"
          >
            {intl("chat.message.edit")}
          </Typography>
        </div>
      }
      description="Edit chat message"
    >
      <div className="tw-my-14">
        <ChatMessage message={message} owner viewOnly />
      </div>
      <SendInput initialMessage={message} onSubmit={onUpdateMessage} />
    </Dialog>
  );
};

export default EditMessage;
