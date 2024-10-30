import React, { useCallback, useMemo } from "react";
import cn from "classnames";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { SelectList, SelectPlacement } from "@/components/Select/types";
import {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  ScrollUpButton,
  ScrollDownButton,
  Viewport,
  Group,
  Item,
  ItemText,
  ItemIndicator,
  SelectItemProps,
} from "@radix-ui/react-select";

export type SelectProps<T extends string | number> = {
  placeholder?: string;
  options?: SelectList<T>;
  value?: T;
  onChange?: (value: T) => void;
  placement?: SelectPlacement;
  children?: React.ReactNode;
};

const OPTIONS_COUNT_THRESHOLD = 10;

export const Select = <T extends string | number>({
  value,
  placeholder,
  options = [],
  onChange,
}: SelectProps<T>) => {
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

  const manyOptions = useMemo(
    () => options.length > OPTIONS_COUNT_THRESHOLD,
    [options.length]
  );

  return (
    <Root dir="rtl" value={value?.toString()} onValueChange={onValueChange}>
      <Trigger
        className={cn(
          "tw-w-full tw-outline-none tw-text-foreground focus:tw-ring-background-control focus:tw-ring-2 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control",
          "tw-border tw-border-control tw-text-sm tw-px-4 tw-py-2 tw-bg-foreground/[0.026] tw-rounded-md tw-h-[38px]",
          "tw-flex tw-justify-between tw-items-center tw-cursor-pointer"
        )}
      >
        <Value placeholder={placeholder} />
        <Icon className="tw-text-foreground">
          <ChevronDownIcon />
        </Icon>
      </Trigger>
      <Portal>
        <Content
          position={manyOptions ? "popper" : "item-aligned"}
          className={cn(
            "tw-bg-background-overlay tw-border tw-rounded-md tw-overflow-hidden",
            manyOptions ? "tw-h-60 tw-min-w-60" : null
          )}
        >
          <ScrollUpButton className="tw-flex tw-h-[25px] tw-cursor-default tw-items-center tw-justify-center tw-bg-background-overlay tw-text-foreground hover:tw-bg-background-selection">
            <ChevronUpIcon />
          </ScrollUpButton>
          <Viewport className="">
            <Group>
              {options.map((option) => (
                <SelectItem value={option.value.toString()} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Group>
          </Viewport>
          <ScrollDownButton className="tw-flex tw-h-[25px] tw-cursor-default tw-items-center tw-justify-center tw-bg-background-overlay tw-text-foreground hover:tw-bg-background-selection">
            <ChevronDownIcon />
          </ScrollDownButton>
        </Content>
      </Portal>
    </Root>
  );
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Item
        className={cn(
          "tw-flex tw-items-center tw-justify-between",
          "hover:tw-bg-background-overlay-hover tw-cursor-pointer tw-text-sm tw-px-3 tw-py-2 tw-mx-0.5",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <ItemText>{children}</ItemText>
        <ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
          <CheckIcon />
        </ItemIndicator>
      </Item>
    );
  }
);
