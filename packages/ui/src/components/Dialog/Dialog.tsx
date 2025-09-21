import {
  Root,
  Title,
  Overlay,
  Content,
  Close,
  Portal,
} from "@radix-ui/react-dialog";
import cn from "classnames";
import React, { useMemo, useRef } from "react";
import X from "@litespace/assets/X";
import { Void } from "@litespace/types";
import { Optional } from "@/components/Optional";
import { Button } from "@/components/Button";
import CloseIcon from "@litespace/assets/Close";
import { Loading, LoadingError } from "@/components/Loading";
import { useFormatMessage } from "@/hooks";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

export const Dialog: React.FC<{
  container?: Element | null;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  open?: boolean;
  description?: string;
  position?: "center" | "bottom";
  headless?: boolean;
  variant?: "default" | "media";
  mediaLoading?: boolean;
  mediaError?: boolean;
  mediaRefetch?: Void;
  setOpen?: (open: boolean) => void;
  close?: Void;
}> = ({
  title,
  children,
  className,
  open,
  description,
  position,
  headless = false,
  variant = "default",
  mediaLoading,
  mediaError,
  mediaRefetch,
  setOpen,
  close,
}) => {
  const intl = useFormatMessage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const mq = useMediaQuery();

  const dialogPosition = useMemo<"center" | "bottom">(() => {
    if (position) return position;
    return mq.sm ? "center" : "bottom";
  }, [position, mq.sm]);

  const hiddenTitle = useMemo(() => {
    if (variant === "media" || headless) return true;
    return false;
  }, [headless, variant]);

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
            const defaultWithin =
              variant === "default" &&
              xc >= xs &&
              xc <= xe &&
              yc >= ys &&
              yc <= ye;

            const mediaWithin =
              (variant === "media" &&
                xc >= xs &&
                xc <= xe &&
                yc >= ys &&
                yc <= ye) ||
              (variant === "media" && yc < 72);

            if (!defaultWithin && !mediaWithin) close();
          }}
          className="fixed inset-0 backdrop-blur-[15px] bg-overlay-dialog z-dialog-overlay"
        >
          {variant === "media" ? (
            <div className="px-6 absolute top-0 left-0 right-0 z-50 h-[72px] bg-natural-100 flex items-center justify-end">
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
          ) : null}
        </Overlay>

        <Content
          ref={dialogRef}
          dir="rtl"
          aria-describedby={description}
          className={cn(
            "fixed bg-natural-50 focus-visible:ring-brand-500 overflow-hidden",
            "z-dialog",
            {
              "p-4 sm:p-6": variant === "default",
              "outline-none": variant === "media",
            },
            {
              "rounded-[32px]":
                variant === "default" && dialogPosition === "center",
              "rounded-t-[24px]": dialogPosition === "bottom",
              "rounded-lg": variant === "media",
            },
            {
              "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus-visible:ring-4 focus-visible:ring-brand-500":
                dialogPosition === "center",
              "left-1/2 bottom-0 -translate-x-1/2": dialogPosition === "bottom",
            },
            className
          )}
        >
          {variant === "media" && mediaLoading ? (
            <div className="min-w-[30vw] min-h-[40vh] flex justify-center items-center">
              <Loading size="large" text={intl("media-dialog.loading")} />
            </div>
          ) : null}

          {variant === "media" && mediaError ? (
            <div className="min-w-[30vw] min-h-[40vh] flex justify-center items-center">
              <LoadingError
                size="large"
                retry={() => {
                  if (!mediaRefetch) return;
                  mediaRefetch();
                }}
                error={intl("media-dialog.error")}
              />
            </div>
          ) : null}

          {(variant === "media" && !mediaLoading && !mediaError) ||
          variant === "default" ? (
            <>
              <Optional show={!hiddenTitle}>
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
            </>
          ) : null}
        </Content>
      </Portal>
    </Root>
  );
};
