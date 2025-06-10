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
import { SelectProps } from "@/components/Select/types";
import { motion, AnimatePresence } from "framer-motion";

const framer = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};

export const Helper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <motion.div {...framer} className="flex">
      {children}
    </motion.div>
  );
};

export const Select = <T extends string | number>({
  id,
  label,
  value,
  placeholder,
  valueDir,
  options = [],
  showDropdownIcon = true,
  disabled = false,
  size = "large",
  state,
  helper,
  className,
  asButton,
  pre,
  post,
  onChange,
  onTriggerClick,
  onOpenChange,
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
      onOpenChange={(open) => {
        if (asButton) return;
        setOpen(open);
        onOpenChange?.(open);
      }}
      value={value?.toString()}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <div className={className}>
        {label ? (
          <Typography
            htmlFor={id}
            tag="label"
            className={cn("mb-1 text-caption font-semibold inline-block", {
              "text-natural-950": !disabled,
              "text-natural-500": disabled,
            })}
          >
            {label}
          </Typography>
        ) : null}

        <div className="flex flex-row items-center">
          {pre}
          <Trigger
            id={id}
            data-open={open}
            disabled={disabled}
            onClick={onTriggerClick}
            role="button"
            className={cn(
              "group flex flex-row justify-between items-center",
              "w-full rounded-lg p-2",
              "bg-natural-50 transition-colors duration-200",
              "transition-colors duration-200",
              "disabled:cursor-not-allowed disabled:bg-natural-100 disabled:border-natural-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              "border",
              {
                // default or filled
                "border-natural-300": !state && !disabled,
                // error
                "border-destructive-600": state === "error",
                // success
                "border-brand-600": state === "success",
              },
              {
                "h-7": size === "small",
                "h-8": size === "medium",
                "h-10": size === "large",
              }
            )}
          >
            <Typography
              tag="span"
              dir={valueDir}
              className={cn("font-medium text-caption", {
                // filled
                "text-natural-950": !disabled && value,
                // placeholder
                "text-natural-600": !value && !disabled,
                // disabled
                "text-natural-500": disabled,
              })}
            >
              {text || placeholder}
            </Typography>

            {showDropdownIcon ? (
              <Icon className="arrow-down">
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
          {post}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {helper ? (
            <Helper>
              <Typography
                tag="span"
                className={cn("mt-1 text-tiny font-semibold", {
                  // default or filled
                  "text-natural-600 group-focus-within:text-natural-600":
                    !state && !disabled,
                  // success
                  "text-success-600": state === "success",
                  // error
                  "text-destructive-600": state === "error",
                  // disabled
                  "text-natural-500": disabled,
                })}
              >
                {helper}
              </Typography>
            </Helper>
          ) : null}
        </AnimatePresence>

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

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
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
          "cursor-pointer focus:outline-none focus:ring-inset focus:ring-1 focus:ring-brand-500 focus:z-select-item",
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
