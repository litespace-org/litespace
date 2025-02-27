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
        "relative border px-[10px] py-2 rounded-lg",
        canceled
          ? "bg-[rgba(153,0,0,0.04)] border-destructive-600 "
          : "bg-[rgba(29,124,78,0.04)] border-brand-700"
      )}
    >
      {children}
    </div>
  );
};
