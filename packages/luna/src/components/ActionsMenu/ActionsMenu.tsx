import React from "react";
import { MoreVertical } from "react-feather";
import { MenuAction } from "@/components/ActionsMenu/types";
import cn from "classnames";
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  DropdownMenuProps,
  DropdownMenuContentProps,
} from "@radix-ui/react-dropdown-menu";

export const ActionsMenu: React.FC<{
  actions: MenuAction[];
  side?: DropdownMenuContentProps["side"];
  children?: React.ReactNode;
  disabled?: boolean;
  onOpenChange?: DropdownMenuProps["onOpenChange"];
  small?: boolean;
}> = ({ actions, children, side, onOpenChange, disabled, small }) => {
  return (
    <Root dir="rtl" onOpenChange={onOpenChange}>
      <Trigger disabled={disabled} asChild>
        {children || (
          <button
            disabled={disabled}
            className={cn(
              "tw-text-center tw-font-normal tw-transition-all tw-ease-out tw-duration-200",
              " tw-rounded-full tw-flex tw-items-center tw-justify-center",
              "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
              "tw-outline-none tw-transition-all tw-outline-0 focus-visible:tw-outline-2 focus-visible:tw-outline-offset-1",
              "tw-bg-background-alternative hover:tw-bg-background-selection dark:tw-bg-muted",
              "tw-border tw-border-border-strong hover:tw-border-border-stronger focus-visible:tw-outline-brand-600 tw-text-foreground",
              {
                "tw-w-6 tw-h-6": small,
                "tw-w-9 tw-h-9": !small,
              }
            )}
          >
            <MoreVertical
              className={cn({
                "tw-w-4 tw-h-4": small,
                "tw-w-5 tw-h-5": !small,
              })}
            />
          </button>
        )}
      </Trigger>

      <Portal>
        <Content
          className={cn(
            "tw-min-w-56 tw-bg-background-overlay tw-border tw-border-border-overlay tw-rounded-md tw-p-[5px]"
          )}
          sideOffset={5}
          side={side}
          loop
        >
          {actions.map((action) => (
            <Item
              key={action.id}
              disabled={action.disabled}
              className={cn(
                "tw-px-2.5 tw-py-1.5 tw-h-[30px] tw-text-sm !tw-leading-none tw-cursor-pointer",
                "tw-ontline-none hover:tw-outline-background-selection",
                action.disabled && "aria-[disabled=true]:tw-opacity-50",
                action.danger && "tw-text-destructive-600"
              )}
              onClick={!action.disabled ? action.onClick : undefined}
            >
              {action.label}
            </Item>
          ))}
        </Content>
      </Portal>
    </Root>
  );
};
