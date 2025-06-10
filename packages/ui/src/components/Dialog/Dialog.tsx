import {
  Root,
  Title,
  Overlay,
  Content,
  Close,
  Portal,
} from "@radix-ui/react-dialog";
import cn from "classnames";
import React, { useRef } from "react";
import X from "@litespace/assets/X";
import { Void } from "@litespace/types";
import { Optional } from "@/components/Optional";

export const Dialog: React.FC<{
  container?: Element | null;
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
  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Portal>
        <Overlay
          data-dialog-overlay
          onClick={(event) => {
            if (!dialogRef.current || !close) return;
            // the dialog should be closed when clicking outside.
            // getting current dialog coordinates
            const { x, y, width, height } =
              dialogRef.current.getBoundingClientRect();
            const xc = event.clientX; // mouse click x coordinate
            const yc = event.clientY; // mouse click y coordinate
            const xs = x; // dialog x-start
            const xe = x + width; // dialog x-end
            const ys = y; // dialog y-start
            const ye = y + height; // dialog y-end
            // the click event is considered within the dialog in case
            // "xc" is between [xs, xe] and "yx" is between [ys, ye]
            const within = xc >= xs && xc <= xe && yc >= ys && yc <= ye;
            if (!within) close();
          }}
          className="fixed inset-0 backdrop-blur-[15px] bg-overlay-dialog z-dialog-overlay"
        />
        <Content
          ref={dialogRef}
          dir="rtl"
          aria-describedby={description}
          className={cn(
            "fixed bg-natural-50 focus-visible:ring-brand-500",
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
            <Optional show={!!close}>
              <Close
                className="w-6 h-6 cursor-pointer flex-shrink-0"
                onClick={close}
              >
                <X />
              </Close>
            </Optional>
          </div>

          {children}
        </Content>
      </Portal>
    </Root>
  );
};
