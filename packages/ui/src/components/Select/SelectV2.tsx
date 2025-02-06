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

export const SelectV2 = <T extends string | number>({
  title,
  value,
  placeholder,
  options = [],
  showDropdownIcon = true,
  disabled = false,
  size = "large",
  helper,
  onChange,
}: SelectProps<T>) => {
  const [open, setOpen] = useState<boolean>(false);

  const label = useMemo(
    () => options.find((option) => option.value === value)?.label,
    [options, value]
  );

  const onValueChange = useCallback(
    (value: string) => {
      const optionValue = options.find(
        (option) => option.value.toString() === value.toString()
      );
      if (!optionValue || !onChange) return;
      onChange(optionValue.value);
    },
    [onChange, options]
  );

  return (
    <Root
      open={open}
      onOpenChange={setOpen}
      dir="rtl"
      value={label?.toString()}
      onValueChange={onValueChange}
      disabled={isEmpty(options) || disabled}
    >
      {title ? (
        <Typography
          className="tw-mb-1 tw-text-natural-950"
          element="caption"
          weight="semibold"
        >
          {title}
        </Typography>
      ) : null}

      <Trigger
        data-open={open}
        disabled={disabled}
        role="button"
        className={cn(
          "tw-flex tw-flex-row tw-justify-between tw-items-center",
          "tw-w-full tw-rounded-lg tw-p-2",
          "tw-bg-natural-50 tw-transition-colors tw-duration-200",
          "tw-border tw-border-natural-300",
          "tw-transition-colors tw-duration-200",
          "disabled:tw-cursor-not-allowed",
          "focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-secondary-600 focus:tw-border-secondary-600",
          {
            "tw-h-7": size === "small",
            "tw-h-8": size === "medium",
            "tw-h-10": size === "large",
          }
        )}
      >
        <Value
          placeholder={
            placeholder ? (
              <Typography
                className={cn("tw-text-natural-600")}
                element="caption"
                weight="medium"
              >
                {placeholder}
              </Typography>
            ) : null
          }
        >
          <Typography
            className={cn("tw-text-natural-800")}
            element="caption"
            weight="medium"
          >
            {label}
          </Typography>
        </Value>
        {showDropdownIcon ? (
          <Icon>
            <ArrowDown
              data-open={open}
              className={cn(
                "tw-w-4 tw-h-4",
                "tw-justify-self-end",
                "data-[open=true]:tw-rotate-180 tw-transition-all tw-duration-300"
              )}
            />
          </Icon>
        ) : null}
      </Trigger>

      {helper ? (
        <Typography
          className="tw-mt-1 tw-text-natural-600"
          element="tiny-text"
          weight="semibold"
        >
          {helper}
        </Typography>
      ) : null}

      <Portal>
        <Content
          position="popper"
          className={cn(
            "tw-bg-natural-50 tw-border tw-border-natural-200 tw-rounded-lg",
            "tw-w-[var(--radix-select-trigger-width)] tw-z-select-dropdown tw-overflow-hidden"
          )}
          sideOffset={helper ? 26 : 14}
        >
          <Viewport>
            <Group
              className={cn(
                "tw-flex tw-flex-col tw-max-h-[204px] tw-overflow-y-auto",
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
          // bg color
          "tw-bg-natural-50 data-[state=unchecked]:focus:tw-bg-natural-100",
          "data-[state=checked]:tw-bg-brand-500",
          // text color
          "tw-text-natural-600 data-[state=checked]:tw-text-natural-50 tw-rounded-lg",
          // display and dimentions
          "tw-flex tw-shrink-0 tw-items-center tw-justify-between",
          "tw-h-[34px] tw-p-2",
          "tw-cursor-pointer focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-secondary-600 focus:tw-z-select-item",
          className
        )}
        {...props}
        ref={ref}
      >
        <ItemText>
          <Typography element="tiny-text" weight="semibold">
            {children}
          </Typography>
        </ItemText>
      </Item>
    );
  }
);
