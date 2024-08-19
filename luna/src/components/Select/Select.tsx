import React from "react";
import * as ISelect from "@radix-ui/react-select";
import cn from "classnames";
import { CheckIcon } from "@radix-ui/react-icons";
import { Dir } from "@/components/Direction";
import { SelectList } from "@/components/Select/types";
import { ChevronDown } from "react-feather";

export const Select: React.FC<{
  dir?: Dir;
  placeholder: string;
  list: SelectList;
  value?: string;
  onChange?: (value: string) => void;
}> = ({ dir, value, placeholder, list, onChange }) => (
  <ISelect.Root value={value} onValueChange={onChange} dir={dir}>
    <ISelect.Trigger
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-md w-full",
        "outline-none focus-visible:ring-2 focus-visible:ring-background-control",
        "border border-control",
        "bg-foreground/[.026]"
      )}
    >
      <ISelect.Value placeholder={placeholder} className="text-xs" />
      <ISelect.Icon className="text-foreground">
        <ChevronDown className="w-[20px] h-[20px]" />
      </ISelect.Icon>
    </ISelect.Trigger>
    <ISelect.Portal>
      <ISelect.Content
        className={cn(
          "border border-border-strong bg-background-control focus-visible:ring-2 focus-visible:ring-background-control w-full rounded-md"
        )}
      >
        <ISelect.Viewport className="p-[5px]">
          <ISelect.Group>
            {list.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </ISelect.Group>
        </ISelect.Viewport>
      </ISelect.Content>
    </ISelect.Portal>
  </ISelect.Root>
);

const SelectItem = React.forwardRef<HTMLDivElement, ISelect.SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <ISelect.Item
        className={cn(
          "text-foreground flex items-center justify-between pr-3 py-2 font-cairo cursor-pointer",
          "outline-none focus-visible:ring-2 focus-visible:ring-border-strong rounded-md",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <ISelect.ItemText>{children}</ISelect.ItemText>
        <ISelect.ItemIndicator className="w-[25px] inline-flex items-center justify-center">
          <CheckIcon />
        </ISelect.ItemIndicator>
      </ISelect.Item>
    );
  }
);
