import React from "react";
import {
  Provider,
  Root,
  Title,
  Description,
  Action,
  Viewport,
} from "@radix-ui/react-toast";
import { Cross2Icon } from "@radix-ui/react-icons";
import cn from "classnames";

export const Toast: React.FC<{
  open?: boolean;
  title: string;
  description?: string;
  onOpenChange?: (value: boolean) => void;
}> = ({ open, onOpenChange, title, description }) => {
  return (
    <Provider swipeDirection="left">
      <Root
        open={open || true}
        onOpenChange={onOpenChange}
        className={cn(
          "tw-border tw-border-border-strong tw-rounded-md tw-p-3 tw-shadow-xl",
          "data-[swipe=cancel]:tw-translate-x-0 data-[swipe=move]:tw-translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:tw-animate-hide data-[state=open]:tw-animate-slide-in data-[swipe=end]:tw-animate-swipe-out data-[swipe=cancel]:tw-transition-[transform_200ms_ease-out]"
        )}
      >
        <div className="tw-flex tw-justify-between">
          <Title className="tw-text-foreground tw-font-semibold tw-w-4/5">
            {title}
          </Title>
          <Action
            altText="close"
            className="hover:tw-bg-background-selection tw-p-1 tw-rounded-md"
          >
            <Cross2Icon />
          </Action>
        </div>
        {description ? (
          <Description asChild>
            <div className="tw-text-foreground-light tw-text-sm">
              {description}
            </div>
          </Description>
        ) : null}
      </Root>
      <Viewport
        className={cn(
          "tw-fixed tw-top-0 tw-left-0 tw-w-96 tw-max-w-[100vw]",
          "tw-list-none tw-flex-col tw-gap-2.5 tw-p-[var(--viewport-padding)] tw-outline-none [--viewport-padding:_25px]"
        )}
      />
    </Provider>
  );
};
