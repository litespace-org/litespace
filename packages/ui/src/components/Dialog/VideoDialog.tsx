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
import { Button } from "@/components/Button";
import CloseIcon from "@litespace/assets/Close";

// @TODO: impl small screen layouts
export const VideoDialog: React.FC<{
  container?: Element | null;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  open?: boolean;
  description?: string;
  position?: "center" | "bottom";
  headless?: boolean;
  setOpen?: (open: boolean) => void;
  close?: Void;
}> = ({
  title,
  children,
  className,
  open,
  description,
  position = "center",
  headless = true,
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
            const within =
              (xc >= xs && xc <= xe && yc >= ys && yc <= ye) || yc < 72;
            if (!within) close();
          }}
          className="fixed inset-0 backdrop-blur-[15px] bg-overlay-dialog z-dialog-overlay"
        >
          <div className="px-6 absolute top-0 left-0 right-0 z-50 h-[72px] bg-natural-100 flex items-center justify-start">
            <Button
              size="large"
              variant="secondary"
              type="natural"
              className="!bg-natural-100 hover:!bg-natural-200 active:!bg-natural-300 !border-natural-700"
              startIcon={
                <CloseIcon className="[&>*]:stroke-natural-700 icon w-4 h-4" />
              }
              onClick={close}
            />
          </div>
        </Overlay>
        <Content
          ref={dialogRef}
          dir="rtl"
          aria-describedby={description}
          className={cn(
            "fixed outline-none  ",
            "z-dialog",
            {
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded focus-visible:ring-4 focus-visible:ring-brand-500":
                position === "center",
              "left-1/2 bottom-0 -translate-x-1/2 rounded-t-[24px]":
                position === "bottom",
            },
            className
          )}
        >
          <Optional show={!headless}>
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
          </Optional>

          {children}
        </Content>
      </Portal>
    </Root>
  );
};
