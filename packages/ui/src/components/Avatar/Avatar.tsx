import React, { useCallback, useState } from "react";
import cn from "classnames";
import { JazzIcon } from "@/components/Avatar/JazzIcon";
import { orUndefined } from "@litespace/utils";
type Status = "loading" | "loaded" | "error";

export const Avatar: React.FC<{
  src?: string | null;
  alt?: string | null;
  seed?: string | number;
  /**
   * property sets how the image should be resized to fit its container.
   */
  object?: "fill" | "contain" | "cover" | "none" | "scale-down";
}> = ({ src, alt, seed, object = "contain" }) => {
  const [status, setStatus] = useState<Status>("loading");

  const onLoad = useCallback(() => {
    setStatus("loaded");
  }, []);

  const onError = useCallback(() => {
    setStatus("error");
  }, []);

  return (
    <div className="relative w-full h-full">
      <img
        data-status={status}
        className={cn(
          "opacity-0 transition-opacity duration-300 ease-linear",
          "data-[status=loaded]:opacity-100 absolute w-full h-full",
          {
            "object-contain": object === "contain",
            "object-fill": object === "fill",
            "object-cover": object === "cover",
            "object-none": object === "none",
            "object-scale-down": object === "scale-down",
          }
        )}
        src={orUndefined(src)}
        alt={orUndefined(alt)}
        onLoad={onLoad}
        onError={onError}
      />

      <div
        data-status={status}
        className={cn(
          "opacity-100 transition-opacity duration-300",
          "data-[status=loaded]:opacity-0",
          "absolute top-0 left-0 w-full h-full z-chat-avatar"
        )}
      >
        <JazzIcon
          seed={seed?.toString() || alt || src || "litespace"}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
