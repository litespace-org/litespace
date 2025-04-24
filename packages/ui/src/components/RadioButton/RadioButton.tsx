import React, { ChangeEvent } from "react";
import cn from "classnames";

export const RadioButton: React.FC<{
  label: React.ReactNode;
  name: string;
  onChange: (e: ChangeEvent) => void;
  checked?: boolean;
  className?: string;
}> = ({ label, name, onChange, checked, className }) => {
  return (
    <label className={cn("flex flex-row items-center", className)}>
      <div className="w-7 h-7 p-2 relative">
        <input
          type="radio"
          name={name}
          className="peer opacity-0 absolute z-10"
          onChange={onChange}
          checked={checked}
        />
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2",
            "w-5 h-5 rounded-full overflow-hidden border-4 border-brand-500"
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
      {label}
    </label>
  );
};

export default RadioButton;
