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
  setOpen?: (open: boolean) => void;
  close?: Void;
  description?: string;
}> = ({
  trigger,
  title,
  children,
  className,
  open,
  description,
  setOpen,
  close,
}) => {
  return (
    <Root open={open} onOpenChange={setOpen}>
      {trigger ? <Trigger>{trigger}</Trigger> : null}
      <Portal>
        <Overlay className="tw-fixed tw-inset-0 tw-backdrop-blur-[15px] tw-bg-overlay-dialog tw-z-10" />
        <Content
          aria-describedby={description}
          dir="rtl"
          className={cn(
            "tw-fixed tw-left-1/2 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-natural-50",
            "tw-rounded-[32px] tw-p-6 tw-min-w-96 tw-z-dialog",
            className
          )}
        >
          <div className="tw-flex tw-justify-between tw-items-center tw-w-full">
            <Title>{title}</Title>
            {close ? (
              <Close onClick={close}>
                <X className="tw-cursor-pointer" />
              </Close>
            ) : null}
          </div>

          {children}
        </Content>
      </Portal>
    </Root>
  );
};
