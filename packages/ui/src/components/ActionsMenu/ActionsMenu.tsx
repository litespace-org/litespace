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
        "relative flex justify-between items-center h-6 select-none rounded-[3px]",
        "pr-2 pl-1 text-caption leading-none outline-none",
        "data-[disabled]:pointer-events-none  data-[disabled]:text-foreground-muted",
        "min-w-fit",
        danger
          ? "text-destructive-600 data-[highlighted]:bg-destructive-300 data-[highlighted]:outline-destructive-400"
          : "text-foreground data-[highlighted]:bg-background-selection data-[highlighted]:outline-border-control"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <p className=" truncate leading-normal">{label}</p>
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
              "text-center font-normal transition-all ease-out duration-200",
              "rounded-full flex items-center justify-center",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "outline-none transition-all outline-0 focus-visible:outline-2 focus-visible:outline-offset-1",
              "bg-background-alternative hover:bg-background-selection dark:bg-muted",
              "border border-border-strong hover:border-border-stronger focus-visible:outline-brand-600 text-foreground",
              {
                "w-6 h-6": small,
                "w-9 h-9": !small,
              }
            )}
          >
            <Icon
              className={cn({
                "w-4 h-4": small,
                "w-5 h-5": !small,
              })}
            />
          </button>
        )}
      </Trigger>

      <Portal>
        <Content
          className={cn(
            "bg-background-overlay border border-border-overlay rounded-md p-1.5",
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
                      "relative flex flex-row justify-between items-center h-7 select-none rounded-sm",
                      "pr-2 pl-1 text-caption leading-none outline-none",
                      "data-[disabled]:pointer-events-none  data-[disabled]:text-foreground-muted",
                      "min-w-56",
                      action.danger
                        ? "text-destructive-600 data-[highlighted]:bg-destructive-300 data-[highlighted]:outline-destructive-400"
                        : "text-foreground data-[highlighted]:bg-background-selection data-[highlighted]:outline-border-control"
                    )}
                  >
                    <p>{action.label}</p>
                    <ChevronLeftIcon />
                  </SubTrigger>

                  <Portal>
                    <SubContent
                      className={cn(
                        "bg-background-overlay border border-border-overlay rounded-md p-1.5"
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
                  <Separator className="h-px bg-border-strong m-1.5" />
                  <Label className="text-foreground-lighter text-caption">
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
                          className="relative flex h-7 leading-none select-none items-center rounded-1 pr-6 pl-1.5 text-caption text-foreground outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-background-selection data-[highlighted]:outline-border-control"
                        >
                          <ItemIndicator className="absolute right-0 inline-flex w-6 items-center justify-center">
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
