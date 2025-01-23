import React from "react";
import { Text } from "@react-email/components";
import cn from "classnames";

const Typography: React.FC<{
  element?: "h4" | "body";
  weight?: "bold" | "semibold" | "medium" | "regular";
  text?: "brand-500" | "natural-950" | "natural-700" | "natural-50";
  children?: React.ReactNode;
}> = ({ element = "body", weight = "regular", children, text }) => {
  return (
    <Text
      className={cn("font-cairo leading-[150%] p-0 m-0 box-border", {
        "text-[32px]": element === "h4",
        "text-base": element === "body",
        "font-bold": weight === "bold",
        "font-semibold": weight === "semibold",
        "font-medium": weight === "medium",
        "font-normal": weight === "regular",
        "text-brand-500": text === "brand-500",
        "text-natural-950": text === "natural-950",
        "text-natural-700": text === "natural-700",
        "text-natural-50": text === "natural-50",
      })}
    >
      {children}
    </Text>
  );
};

export default Typography;
