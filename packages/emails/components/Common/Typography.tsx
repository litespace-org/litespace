import React from "react";
import { Text } from "@react-email/components";
import cn from "classnames";

const Typography: React.FC<{
  element?: "h3" | "h4" | "body";
  weight?: "bold" | "semibold" | "medium" | "regular";
  text?:
    | "brand-500"
    | "brand-700"
    | "natural-950"
    | "natural-700"
    | "natural-50";
  children?: React.ReactNode;
  spacedBy?: number;
}> = ({ element = "body", weight = "regular", children, text, spacedBy }) => {
  return (
    <Text
      className={cn("leading-[150%] p-0 m-0 box-border", {
        "text-[40px]": element === "h3",
        "text-[32px]": element === "h4",
        "text-base": element === "body",
        "font-bold": weight === "bold",
        "font-semibold": weight === "semibold",
        "font-medium": weight === "medium",
        "font-normal": weight === "regular",
        "text-brand-500": text === "brand-500",
        "text-brand-700": text === "brand-700",
        "text-natural-950": text === "natural-950",
        "text-natural-700": text === "natural-700",
        "text-natural-50": text === "natural-50",
      })}
      style={{
        letterSpacing: spacedBy ? `${spacedBy}px` : "0px",
      }}
    >
      {children}
    </Text>
  );
};

export default Typography;
