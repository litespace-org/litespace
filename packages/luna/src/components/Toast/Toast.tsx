import React from "react";
import { Root, Title, Description, Action } from "@radix-ui/react-toast";
import { Cross2Icon } from "@radix-ui/react-icons";
import cn from "classnames";

export const Toast: React.FC<{
  open?: boolean;
  title: string;
  description?: string;
  onOpenChange?: (value: boolean) => void;
  key?: number;
}> = ({ open, onOpenChange, title, description, key }) => {
  return (
    <Root
      open={open}
      key={key}
      onOpenChange={onOpenChange}
      className={cn(
        "tw-border tw-border-border-strong tw-rounded-md tw-p-3 tw-shadow-xl tw-bg-dash-sidebar",
        "data-[swipe=cancel]:tw-translate-x-0 data-[swipe=move]:tw-translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:tw-animate-hide data-[state=open]:tw-animate-slide-in data-[swipe=end]:tw-animate-swipe-out data-[swipe=cancel]:tw-transition-[transform_200ms_ease-out]"
      )}
    >
      <div className="tw-flex tw-justify-between">
        <Title
          dir="rtl"
          className="tw-text-foreground tw-font-semibold tw-w-4/5"
        >
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
  );
};
