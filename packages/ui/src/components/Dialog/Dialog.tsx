import {
  Root,
  Title,
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
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  open?: boolean;
  description?: string;
  position?: "center" | "bottom";
  setOpen?: (open: boolean) => void;
  close?: Void;
}> = ({
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
      <Portal>
        <Overlay
          onClick={close}
          className="fixed inset-0 backdrop-blur-[15px] bg-overlay-dialog z-dialog-overlay"
        />
        <Content
          aria-describedby={description}
          dir="rtl"
          className={cn(
            "fixed bg-natural-50",
            "p-4 sm:p-6 z-dialog",
            {
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[32px]":
                position === "center",
              "left-1/2 bottom-0 -translate-x-1/2 rounded-t-[24px]":
                position === "bottom",
            },
            className
          )}
        >
          <div className="flex justify-between items-center w-full">
            <Title>{title}</Title>
            {close ? (
              <Close
                className="w-6 h-6 cursor-pointer flex-shrink-0"
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
