import React from "react";
import cn from "classnames";
import { OmitProp } from "@litespace/types";

type InputProps = OmitProp<React.InputHTMLAttributes<HTMLInputElement>, "type">;

export const RadioButton: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <div className="w-7 h-7 p-2 relative">
      <input
        type="radio"
        className={cn(
          "peer opacity-0 absolute inset-0 z-radio-button cursor-pointer disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />

      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
          "w-5 h-5 rounded-full overflow-hidden border-2 border-brand-500",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-secondary-600 peer-focus-visible:ring-offset-2",
          props.checked && "border-4"
        )}
      />

      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
          "w-3 h-3 rounded-full overflow-hidden bg-brand-700 invisible",
          "peer-checked:visible"
        )}
      />
    </div>
  );
};

export default RadioButton;
