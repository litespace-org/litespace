import React, { useCallback, useState } from "react";
import cn from "classnames";
import { JazzIcon } from "@/components/Avatar/JazzIcon";
type Status = "loading" | "loaded" | "error";

export const Avatar: React.FC<{
  src?: string;
  alt?: string;
  seed?: string;
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
    <div className="tw-relative tw-w-full tw-h-full">
      <img
        data-status={status}
        className={cn(
          "tw-opacity-0 tw-transition-opacity tw-duration-300 tw-ease-linear",
          "data-[status=loaded]:tw-opacity-100 tw-absolute tw-w-full tw-h-full",
          {
            "tw-object-contain": object === "contain",
            "tw-object-fill": object === "fill",
            "tw-object-cover": object === "cover",
            "tw-object-none": object === "none",
            "tw-object-scale-down": object === "scale-down",
          }
        )}
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
      />

      <div
        data-status={status}
        className={cn(
          "tw-opacity-100 tw-transition-opacity tw-duration-300",
          "data-[status=loaded]:tw-opacity-0",
          "tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-z-[1]"
        )}
      >
        <JazzIcon
          seed={seed || alt || src || "litespace"}
          className="tw-h-full"
        />
      </div>
    </div>
  );
};
