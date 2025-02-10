import {
  Root,
  Title,
  Trigger,
  Overlay,
  Content,
  Close,
  Portal,
} from "@radix-ui/react-dialog";
import cn from "classnames";
import React from "react";
import X from "@litespace/assets/X";
import { Void } from "@litespace/types";

export const Dialog: React.FC<{
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  open?: boolean;
  description?: string;
  position?: "center" | "bottom";
  setOpen?: (open: boolean) => void;
  close?: Void;
}> = ({
  trigger,
  title,
  children,
  className,
  open,
  description,
  position = "center",
  setOpen,
  close,
}) => {
  return (
    <Root open={open} onOpenChange={setOpen}>
      {trigger ? <Trigger>{trigger}</Trigger> : null}
      <Portal>
        <Overlay
          onClick={close}
          className="tw-fixed tw-inset-0 tw-backdrop-blur-[15px] tw-bg-overlay-dialog tw-z-dialog-overlay"
        />
        <Content
          aria-describedby={description}
          dir="rtl"
          className={cn(
            "tw-fixed tw-bg-natural-50",
            "tw-p-4 sm:tw-p-6 tw-z-dialog",
            {
              "tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-rounded-[32px]":
                position === "center",
              "tw-bottom-0 tw-left-1/2 -tw-translate-x-1/2 tw-rounded-t-[24px]":
                position === "bottom",
            },
            className
          )}
        >
          <div className="tw-flex tw-justify-between tw-items-center tw-w-full">
            <Title>{title}</Title>
            {close ? (
              <Close
                className="tw-w-6 tw-h-6 tw-cursor-pointer"
                onClick={close}
              >
                <X />
              </Close>
            ) : null}
          </div>

          {children}
        </Content>
      </Portal>
    </Root>
  );
};
