import React from "react";
import * as ISelect from "@radix-ui/react-select";
import cn from "classnames";
import { CheckIcon } from "@radix-ui/react-icons";
import { Dir } from "@/components/Direction";
import ArrowDown from "@/icons/ArrowDown";
import { SelectList } from "@/components/Select/types";

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
        "ui-flex ui-justify-between ui-items-center ui-py-[10px] ui-px-lg ui-bg-inputbg ui-rounded-2xl ui-h-[72px] ui-min-w-[300px]",
        "ui-font-cairo ui-w-full"
      )}
    >
      <ISelect.Value
        placeholder={placeholder}
        className={cn("ui-text-[18px] ui-font-medium")}
      />
      <ISelect.Icon className="ui-text-violet11">
        <ArrowDown />
      </ISelect.Icon>
    </ISelect.Trigger>
    <ISelect.Portal>
      <ISelect.Content
        className={cn(
          "ui-overflow-hidden ui-bg-white ui-rounded-md",
          "ui-shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]",
          "ui-w-fit ui-min-w-[20rem]"
        )}
      >
        <ISelect.Viewport className="ui-p-[5px]">
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
          "ui-text-arxl ui-text-dark-100 ui-rounded-[3px] ui-flex ui-items-center ui-cursor-pointer ui-border-r-4 ui-border-transparent",
          "ui-font-medium ui-leading-normal ui-font-cairo ui-mb-md",
          "ui-p-lg ui-relative ui-select-none ui-data-[disabled]:text-mauve8 data-[disabled]:ui-pointer-events-none data-[highlighted]:ui-outline-none data-[highlighted]:ui-bg-light data-[highlighted]:ui-text-dark-100 data-[highlighted]:ui-border-blue-normal",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <ISelect.ItemText>{children}</ISelect.ItemText>
        <ISelect.ItemIndicator className="ui-absolute ui-left-0 ui-w-[25px] ui-inline-flex ui-items-center ui-justify-center">
          <CheckIcon />
        </ISelect.ItemIndicator>
      </ISelect.Item>
    );
  }
);
