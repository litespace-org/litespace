import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import cn from "classnames";
import Close from "@litespace/assets/Close";
import EditMessageIcon from "@litespace/assets/EditMessage";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";
import { ChatMessage, SendInput } from "@/components/Chat";

export const EditMessage: React.FC<{
  message: { text: string; id: number } | null;
  submit: (value: string) => void;
  open?: boolean;
  className?: string;
  setOpen?: (open: boolean) => void;
  close: () => void;
}> = ({ className, close, open, setOpen, message, submit }) => {
  const intl = useFormatMessage();
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      {message ? (
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="tw-fixed tw-inset-0 tw-bg-background-overlay-editMessage tw-backdrop-blur-[15px] tw-z-[98]" />
          <RadixDialog.Content
            dir="rtl"
            className={cn(
              "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-natural-50",
              "tw-rounded-[32px] tw-p-10 tw-w-[776px] tw-z-[99]",
              className
            )}
          >
            <div className="tw-flex tw-justify-between tw-items-center">
              <RadixDialog.Title className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                <EditMessageIcon className="[&>*]:tw-stroke-natural-950" />
                <Typography
                  element="subtitle-2"
                  className="tw-font-bold tw-text-natural-950"
                >
                  {intl("chat.message.edit")}
                </Typography>
              </RadixDialog.Title>
              <RadixDialog.Close onClick={close}>
                <Close />
              </RadixDialog.Close>
            </div>
            <div className="tw-my-14">
              <ChatMessage message={message} owner={true} viewOnly />
            </div>
            <SendInput initialMessage={message} onSubmit={submit} />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      ) : null}
    </RadixDialog.Root>
  );
};
export default EditMessage;
