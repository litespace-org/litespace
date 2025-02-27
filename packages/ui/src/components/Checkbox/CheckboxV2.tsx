import React from "react";
import { Root, Indicator } from "@radix-ui/react-checkbox";
import Check from "@litespace/assets/Check";
import cn from "classnames";

const CheckboxV2: React.FC<{
  disabled?: boolean;
  checked?: boolean;
  id?: string;
  onCheckedChange?: (checked: boolean) => void;
}> = ({ disabled, checked, id, onCheckedChange }) => {
  return (
    <div
      className={cn(
        "h-10 w-10 flex items-center justify-center transition-all duration-200",
        "rounded-full hover:bg-brand-50 active:bg-brand-200 shrink-0"
      )}
    >
      <Root
        disabled={disabled}
        checked={checked}
        onCheckedChange={onCheckedChange}
        id={id}
        className={cn(
          "border-2 border-brand-500 w-[1.125rem] h-[1.125rem] rounded-sm",
          "data-[state=checked]:bg-brand-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Indicator className="text-natural-50">
          <Check />
        </Indicator>
      </Root>
    </div>
  );
};

export default CheckboxV2;
