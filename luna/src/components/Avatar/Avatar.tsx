import React from "react";
import { Root, Fallback, Image } from "@radix-ui/react-avatar";
import cn from "classnames";

export const Avatar: React.FC<{
  src?: string;
  alt?: string;
  fallback: string;
}> = ({ src, alt, fallback }) => {
  return (
    <Root
      className={cn(
        "ui-inline-flex ui-items-center ui-justify-center",
        "ui-w-11 ui-h-11 ui-rounded-full ui-overflow-hidden ui-font-mada"
      )}
    >
      {src ? <Image src={src} alt={alt} /> : null}
      <Fallback
        className={cn(
          "ui-w-full ui-h-full",
          "ui-flex ui-items-center ui-justify-center",
          "ui-bg-gray-100 ui-font-bold"
        )}
      >
        {fallback}
      </Fallback>
    </Root>
  );
};
