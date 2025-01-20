import React from "react";
import Tailwind from "@/components/Tailwind";
import { Text } from "@react-email/components";
import cn from "classnames";

const Typography: React.FC<{
  element: "h4" | "body";
  weight: "bold" | "semibold" | "medium" | "regular";
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ element, weight, inline = false, className, children }) => {
  return (
    <Tailwind>
      <Text
        className={cn(
          "font-cairo leading-[150%] p-0 m-0 box-border rtl-dir",
          {
            inline: inline,
            "text-[2rem]": element === "h4",
            "text-[1rem]": element === "body",
            "font-bold": weight === "bold",
            "font-semibold": weight === "semibold",
            "font-medium": weight === "medium",
            "font-normal": weight === "regular",
          },
          className
        )}
      >
        {children}
      </Text>
    </Tailwind>
  );
};

export default Typography;
