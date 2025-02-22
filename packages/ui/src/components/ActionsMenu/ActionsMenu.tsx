import React from "react";
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
  Sub,
  SubTrigger,
  SubContent,
  Separator,
  Label,
  ItemIndicator,
  RadioGroup,
  RadioItem,
} from "@radix-ui/react-dropdown-menu";
import { Void } from "@litespace/types";
import {
  CheckIcon,
  ChevronLeftIcon,
  DotFilledIcon,
  DotsVerticalIcon,
} from "@radix-ui/react-icons";

const MenuItem: React.FC<{
  label: string | React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  onClick?: Void;
}> = ({ label, disabled, danger, checked, onClick }) => {
  return (
    <Item
      disabled={disabled}
      className={cn(
        "tw-relative tw-flex tw-justify-between tw-items-center tw-h-6 tw-select-none tw-rounded-[3px]",
        "tw-pr-2 tw-pl-1 tw-text-caption tw-leading-none outline-none",
        "data-[disabled]:pointer-events-none  data-[disabled]:tw-text-foreground-muted",
        "tw-min-w-fit",
        danger
          ? "tw-text-destructive-600 data-[highlighted]:tw-bg-destructive-300 data-[highlighted]:tw-outline-destructive-400"
          : "tw-text-foreground data-[highlighted]:tw-bg-background-selection data-[highlighted]:tw-outline-border-control"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <p className=" tw-truncate tw-leading-normal">{label}</p>
      {checked ? <CheckIcon /> : null}
    </Item>
  );
};

export const ActionsMenu: React.FC<{
  actions: MenuAction[];
  side?: DropdownMenuContentProps["side"];
  children?: React.ReactNode;
  disabled?: boolean;
  onOpenChange?: DropdownMenuProps["onOpenChange"];
  small?: boolean;
  Icon?: typeof DotsVerticalIcon;
  menuClassName?: string;
}> = ({
  actions,
  children,
  side,
  onOpenChange,
  disabled,
  small,
  Icon = DotsVerticalIcon,
  menuClassName,
}) => {
  return (
    <Root dir="rtl" onOpenChange={onOpenChange}>
      <Trigger disabled={disabled} asChild>
        {children || (
          <button
            disabled={disabled}
            className={cn(
              "tw-text-center tw-font-normal tw-transition-all tw-ease-out tw-duration-200",
              "tw-rounded-full tw-flex tw-items-center tw-justify-center",
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
            <Icon
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
            "tw-bg-background-overlay tw-border tw-border-border-overlay tw-rounded-md tw-p-1.5",
            menuClassName
          )}
          sideOffset={5}
          side={side}
          loop
        >
          {actions.map((action) => {
            if (action.subActions)
              return (
                <Sub key={action.id}>
                  <SubTrigger
                    className={cn(
                      "tw-relative tw-flex tw-flex-row tw-justify-between tw-items-center tw-h-7 tw-select-none tw-rounded-sm",
                      "tw-pr-2 tw-pl-1 tw-text-caption tw-leading-none outline-none",
                      "data-[disabled]:pointer-events-none  data-[disabled]:tw-text-foreground-muted",
                      "tw-min-w-56",
                      action.danger
                        ? "tw-text-destructive-600 data-[highlighted]:tw-bg-destructive-300 data-[highlighted]:tw-outline-destructive-400"
                        : "tw-text-foreground data-[highlighted]:tw-bg-background-selection data-[highlighted]:tw-outline-border-control"
                    )}
                  >
                    <p>{action.label}</p>
                    <ChevronLeftIcon />
                  </SubTrigger>

                  <Portal>
                    <SubContent
                      className={cn(
                        "tw-bg-background-overlay tw-border tw-border-border-overlay tw-rounded-md tw-p-1.5"
                      )}
                      sideOffset={2}
                      alignOffset={-5}
                    >
                      {action.subActions.map((action) => (
                        <MenuItem
                          key={action.id}
                          label={action.label}
                          disabled={action.disabled}
                          danger={action.danger}
                          checked={action.checked}
                          onClick={action.onClick}
                        />
                      ))}
                    </SubContent>
                  </Portal>
                </Sub>
              );

            if (action.radioGroup)
              return (
                <div key={action.id}>
                  <Separator className="tw-h-px tw-bg-border-strong tw-m-1.5" />
                  <Label className="tw-text-foreground-lighter tw-text-caption">
                    {action.label}
                  </Label>
                  <RadioGroup
                    value={action.value}
                    onValueChange={action.onRadioValueChange}
                  >
                    {action.radioGroup.map((item) => {
                      return (
                        <RadioItem
                          key={item.id}
                          value={item.value}
                          className="tw-relative tw-flex tw-h-7 tw-leading-none tw-select-none tw-items-center tw-rounded-1 tw-pr-6 tw-pl-1.5 tw-text-caption tw-text-foreground outline-none data-[disabled]:pointer-events-none data-[highlighted]:tw-bg-background-selection data-[highlighted]:tw-outline-border-control"
                        >
                          <ItemIndicator className="tw-absolute tw-right-0 tw-inline-flex tw-w-6 tw-items-center tw-justify-center">
                            <DotFilledIcon />
                          </ItemIndicator>
                          {item.label}
                        </RadioItem>
                      );
                    })}
                  </RadioGroup>
                </div>
              );
            return (
              <MenuItem
                key={action.id}
                label={action.label}
                disabled={action.disabled}
                danger={action.danger}
                checked={action.checked}
                onClick={action.onClick}
              />
            );
          })}
        </Content>
      </Portal>
    </Root>
  );
};
