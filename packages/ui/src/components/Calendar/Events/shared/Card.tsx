import React from "react";
import cn from "classnames";

export const Card: React.FC<{
  children: React.ReactNode;
  canceled?: boolean;
  height?: number;
  minHeight?: number;
  marginTop?: number;
}> = ({ children, canceled, height, minHeight, marginTop = 0 }) => {
  return (
    <div
      style={{
        height: height + "px",
        minHeight: minHeight + "px",
        marginTop: marginTop + "px",
      }}
      className={cn(
        "tw-relative tw-border tw-px-[10px] tw-py-2 tw-rounded-lg",
        canceled
          ? "tw-bg-[rgba(153,0,0,0.04)] tw-border-destructive-600 "
          : "tw-bg-[rgba(29,124,78,0.04)] tw-border-brand-700"
      )}
    >
      {children}
    </div>
  );
};
