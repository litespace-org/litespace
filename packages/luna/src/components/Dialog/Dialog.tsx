import * as RadixDialog from "@radix-ui/react-dialog";
import cn from "classnames";
import React from "react";
import { Cross2Icon } from "@radix-ui/react-icons";

export const Dialog: React.FC<{
  trigger?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  description?: string;
  open?: boolean;
  className?: string;
  setOpen?: (open: boolean) => void;
  close: () => void;
}> = ({
  trigger,
  title,
  children,
  description,
  className,
  close,
  open,
  setOpen,
}) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      {trigger ? <RadixDialog.Trigger>{trigger}</RadixDialog.Trigger> : null}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="tw-fixed tw-inset-0 tw-bg-transparent tw-backdrop-blur-sm" />
        <RadixDialog.Content
          dir="rtl"
          className={cn(
            "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-background-dialog",
            "tw-border tw-border-border-strong tw-rounded-md tw-px-5 tw-py-4 tw-shadow-lg tw-min-w-96",
            className
          )}
        >
          <div className="tw-flex tw-justify-between mb-4">
            <RadixDialog.Title className="tw-font-semibold">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Close
              onClick={close}
              className="hover:tw-bg-background-selection tw-rounded-md"
            >
              <Cross2Icon className="tw-cursor-pointer tw-w-6 tw-h-6 tw-p-0.5" />
            </RadixDialog.Close>
          </div>

          {description ? (
            <RadixDialog.Description className="tw-mb-4">
              {description}
            </RadixDialog.Description>
          ) : null}

          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
