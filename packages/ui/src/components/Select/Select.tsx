import React, { useCallback, useMemo, useState } from "react";
import cn from "classnames";
import {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Group,
  Item,
  ItemText,
  SelectItemProps,
} from "@radix-ui/react-select";
import ArrowDown from "@litespace/assets/ArrowDown";
import { Typography } from "@/components/Typography";
import { isEmpty } from "lodash";
import { SelectProps } from "@/components/Select/types";

export const Select = <T extends string | number>({
  value,
  placeholder,
  options = [],
  showDropdownIcon = true,
  disabled = false,
  onChange,
}: SelectProps<T>) => {
  const [open, setOpen] = useState<boolean>(false);
  const onValueChange = useCallback(
    (value: string) => {
      if (!onChange) return;
      const optionValue = options.find(
        (option) => option.value.toString() === value
      );
      if (!optionValue) return;
      onChange(optionValue.value);
    },
    [onChange, options]
  );

  const label = useMemo(
    () => options.find((option) => option.value === value)?.label,
    [options, value]
  );

  return (
    <Root
      open={open}
      onOpenChange={setOpen}
      dir="rtl"
      value={value?.toString()}
      onValueChange={onValueChange}
      disabled={isEmpty(options) || disabled}
    >
      <Trigger
        data-open={open}
        disabled={disabled}
        className={cn(
          "tw-flex tw-flex-row tw-justify-between tw-items-center",
          "tw-w-full tw-h-14 tw-rounded-lg tw-p-2 tw-transition-colors tw-duration-200",
          "tw-border tw-border-natural-300 hover:tw-border-brand-200 focus:tw-border-brand-500",
          "data-[error=true]:tw-border-destructive-500 data-[error=true]:tw-shadow-ls-x-small data-[error=true]:tw-shadow-[rgba(204,0,0,0.25)]",
          "focus:tw-outline-none focus:tw-shadow-ls-x-small focus:tw-shadow-[rgba(43,181,114,0.25)]",
          "tw-bg-natural-50 hover:tw-bg-brand-50",
          "data-[open=true]:tw-shadow-ls-x-small data-[open=true]:tw-shadow-[rgba(43,181,114,0.25)] data-[open=true]:tw-border-brand-500",
          "disabled:tw-cursor-not-allowed"
        )}
      >
        <Value
          placeholder={
            placeholder ? (
              <Typography tag="label" className={cn("tw-text-natural-400")}>
                {placeholder}
              </Typography>
            ) : null
          }
        >
          <Typography tag="label" className={cn("tw-text-natural-900")}>{label}</Typography>
        </Value>
        {showDropdownIcon ? (
          <Icon>
            <ArrowDown
              data-open={open}
              className={cn(
                "tw-justify-self-end",
                "data-[open=true]:tw-rotate-180 tw-transition-all tw-duration-300"
              )}
            />
          </Icon>
        ) : null}
      </Trigger>
      <Portal>
        <Content
          position="popper"
          className={cn(
            "tw-bg-natural-50 tw-border tw-border-brand-400 tw-p-1 tw-rounded-lg",
            "tw-w-[var(--radix-select-trigger-width)] tw-z-select-dropdown"
          )}
          sideOffset={12}
        >
          <Viewport className="focus:tw-outline-red-500">
            <Group
              className={cn(
                "tw-flex tw-flex-col tw-gap-1 tw-max-h-64 tw-overflow-y-auto",
                "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent"
              )}
            >
              {options.map((option) => (
                <SelectItem value={option.value.toString()} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Group>
          </Viewport>
        </Content>
      </Portal>
    </Root>
  );
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Item
        className={cn(
          "tw-h-14 tw-flex tw-shrink-0 tw-items-center tw-justify-between",
          "data-[state=unchecked]:hover:tw-bg-natural-100 data-[state=unchecked]:hover:tw-text-natural-900",
          "focus:tw-outline-none data-[state=unchecked]:focus:tw-bg-natural-100",
          "data-[state=unchecked]:active:tw-bg-brand-700 data-[state=unchecked]:active:tw-text-natural-50",
          "tw-cursor-pointer tw-px-3 tw-rounded-lg",
          "data-[state=checked]:tw-bg-brand-700 data-[state=checked]:tw-text-natural-50",
          className
        )}
        {...props}
        ref={ref}
      >
        <ItemText className="tw-text-natural-900">
          <Typography tag="label">{children}</Typography>
        </ItemText>
      </Item>
    );
  }
);
