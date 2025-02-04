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
import React, { useMemo } from "react";

import X from "@litespace/assets/X";
import { Void } from "@litespace/types";
import { Animate, AnimatePopup } from "@/components/Animate";
import { AnimatePresence } from "framer-motion";

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
  nopopup?: boolean;
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
  nopopup,
}) => {
  const ContentContainer = useMemo(
    () => (nopopup ? Animate : AnimatePopup),
    [nopopup]
  );
  return (
    <AnimatePresence>
      {open ? (
        <Root open={true} onOpenChange={setOpen}>
          {trigger ? <Trigger>{trigger}</Trigger> : null}
          <Portal>
            <Overlay
              onClick={close}
              className={cn(
                "tw-fixed tw-flex tw-flex-col tw-items-center tw-inset-0 tw-backdrop-blur-[15px] tw-bg-overlay-dialog tw-z-10",
                {
                  "tw-justify-center": position === "center",
                  "tw-justify-end": position === "bottom",
                }
              )}
            >
              <ContentContainer
                className={cn(
                  "tw-absolute tw-bg-natural-50",
                  "tw-p-6 tw-min-w-96 tw-z-dialog",
                  {
                    "tw-rounded-[32px]": position === "center",
                    "tw-rounded-t-[24px]": position === "bottom",
                  },
                  className
                )}
              >
                <Content aria-describedby={description} dir="rtl">
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
              </ContentContainer>
            </Overlay>
          </Portal>
        </Root>
      ) : null}
    </AnimatePresence>
  );
};
