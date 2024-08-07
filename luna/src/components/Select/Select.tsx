import React from "react";
import * as ISelect from "@radix-ui/react-select";
import cn from "classnames";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { Dir } from "@/components/Direction";
import ArrowDown from "@/icons/ArrowDown";

export const Select: React.FC<{ dir?: Dir; placeholder: string }> = ({
  dir,
  placeholder,
}) => (
  <ISelect.Root dir={dir}>
    <ISelect.Trigger
      className={cn(
        "ui-flex ui-justify-center ui-items-center ui-py-[10px] ui-px-lg ui-bg-inputbg ui-rounded-2xl ui-h-[72px]"
      )}
    >
      <ISelect.Value placeholder={placeholder} />
      <ISelect.Icon className="ui-text-violet11">
        <ArrowDown />
      </ISelect.Icon>
    </ISelect.Trigger>
    <ISelect.Portal>
      <ISelect.Content
        className={cn(
          "ui-overflow-hidden ui-bg-white ui-rounded-md ui-shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
        )}
      >
        <ISelect.ScrollUpButton className="ui-flex ui-items-center ui-justify-center ui-h-[25px] ui-bg-white ui-text-violet11 ui-cursor-default">
          <ChevronUpIcon />
        </ISelect.ScrollUpButton>
        <ISelect.Viewport className="ui-p-[5px]">
          <ISelect.Group>
            <ISelect.Label className="ui-px-[25px] ui-text-xs ui-leading-[25px] ui-text-mauve11">
              Fruits
            </ISelect.Label>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </ISelect.Group>

          <ISelect.Separator className="ui-h-[1px] ui-bg-violet6 ui-m-[5px]" />

          <ISelect.Group>
            <ISelect.Label className="ui-px-[25px] ui-text-xs ui-leading-[25px] ui-text-mauve11">
              Vegetables
            </ISelect.Label>
            <SelectItem value="aubergine">Aubergine</SelectItem>
            <SelectItem value="broccoli">Broccoli</SelectItem>
            <SelectItem value="carrot" disabled>
              Carrot
            </SelectItem>
            <SelectItem value="courgette">Courgette</SelectItem>
            <SelectItem value="leek">Leek</SelectItem>
          </ISelect.Group>

          <ISelect.Separator className="ui-h-[1px] ui-bg-violet6 ui-m-[5px]" />

          <ISelect.Group>
            <ISelect.Label className="ui-px-[25px] ui-text-xs ui-leading-[25px] ui-text-mauve11">
              Meat
            </ISelect.Label>
            <SelectItem value="beef">Beef</SelectItem>
            <SelectItem value="chicken">Chicken</SelectItem>
            <SelectItem value="lamb">Lamb</SelectItem>
            <SelectItem value="pork">Pork</SelectItem>
          </ISelect.Group>
        </ISelect.Viewport>
        <ISelect.ScrollDownButton className="ui-flex ui-items-center ui-justify-center ui-h-[25px] ui-bg-white ui-text-violet11 ui-cursor-default">
          <ChevronDownIcon />
        </ISelect.ScrollDownButton>
      </ISelect.Content>
    </ISelect.Portal>
  </ISelect.Root>
);

const SelectItem = React.forwardRef<HTMLDivElement, ISelect.SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <ISelect.Item
        className={cn(
          "ui-text-[13px] ui-leading-none ui-text-violet11 ui-rounded-[3px] ui-flex ui-items-center",
          "ui-h-[25px] ui-pr-[35px] ui-pl-[25px] ui-relative ui-select-none ui-data-[disabled]:text-mauve8 data-[disabled]:ui-pointer-events-none data-[highlighted]:ui-outline-none data-[highlighted]:ui-bg-violet9 data-[highlighted]:ui-text-violet1",
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
