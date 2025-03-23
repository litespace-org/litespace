import React, { useCallback, useMemo, useState } from "react";
import cn from "classnames";
import {
  Root,
  Trigger,
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
  id,
  label,
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

  const text = useMemo(
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
      dir="rtl"
      open={open}
      onOpenChange={setOpen}
      value={value?.toString()}
      onValueChange={onValueChange}
      disabled={isEmpty(options) || disabled}
    >
      <div>
        {label ? (
          <Typography
            htmlFor={id}
            tag="label"
            className="mb-1 text-natural-950 text-caption font-semibold inline-block"
          >
            {label}
          </Typography>
        ) : null}

        <Trigger
          id={id}
          data-open={open}
          disabled={disabled}
          role="button"
          className={cn(
            "flex flex-row justify-between items-center",
            "w-full rounded-lg p-2",
            "bg-natural-50 transition-colors duration-200",
            "border border-natural-300",
            "transition-colors duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "focus:outline-none focus:ring-2 focus:ring-secondary-600 focus:ring-inset",
            {
              "h-7": size === "small",
              "h-8": size === "medium",
              "h-10": size === "large",
            }
          )}
        >
          <Typography
            tag="span"
            className={cn(
              "text-natural-600 font-medium text-caption",
              disabled && "text-natural-300"
            )}
          >
            {text || placeholder}
          </Typography>
          {showDropdownIcon ? (
            <Icon>
              <ArrowDown
                data-open={open}
                className={cn(
                  "w-4 h-4",
                  "justify-self-end",
                  "data-[open=true]:rotate-180 transition-all duration-300"
                )}
              />
            </Icon>
          ) : null}
        </Trigger>

        {helper ? (
          <Typography
            tag="span"
            className="mt-1 text-natural-600 text-tiny font-semibold"
          >
            {helper}
          </Typography>
        ) : null}

        <Portal>
          <Content
            position="popper"
            className={cn(
              "bg-natural-50 border border-natural-200 rounded-lg",
              "w-[var(--radix-select-trigger-width)] z-select-dropdown overflow-hidden shadow-select-menu"
            )}
            sideOffset={helper ? 26 : 4}
          >
            <Viewport>
              <Group
                className={cn(
                  "flex flex-col max-h-[204px] overflow-y-auto",
                  "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent"
                )}
              >
                {options.map((option) => (
                  <SelectItem
                    value={option.value.toString()}
                    key={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Group>
            </Viewport>
          </Content>
        </Portal>
      </div>
    </Root>
  );
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Item
        className={cn(
          // bg color
          "bg-natural-50 data-[state=unchecked]:focus:bg-natural-100",
          "data-[state=checked]:bg-brand-500",
          // text color
          "text-natural-600 data-[state=checked]:text-natural-50 rounded-lg",
          // display and dimentions
          "flex shrink-0 items-center justify-between",
          "h-[34px] p-2",
          "cursor-pointer focus:outline-none focus:ring-inset focus:ring-1 focus:ring-secondary-600 focus:z-select-item",
          "data-[disabled]:cursor-not-allowed",
          className
        )}
        {...props}
        ref={ref}
      >
        <ItemText>
          <Typography tag="div" className="text-tiny font-semibold">
            {children}
          </Typography>
        </ItemText>
      </Item>
    );
  }
);
