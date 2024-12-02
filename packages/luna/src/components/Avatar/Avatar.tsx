import React, { useCallback, useState } from "react";
import cn from "classnames";
import { JazzIcon } from "@/components/Avatar/JazzIcon";
type Status = "loading" | "loaded" | "error";

export const Avatar: React.FC<{
  src?: string;
  alt?: string;
  seed?: string;
}> = ({ src, alt, seed }) => {
  const [status, setStatus] = useState<Status>("loading");

  const onLoad = useCallback(() => {
    setStatus("loaded");
  }, []);

  const onError = useCallback(() => {
    setStatus("error");
  }, []);

  return (
    <div className="tw-relative">
      <img
        data-status={status}
        className={cn(
          "tw-opacity-0 tw-transition-opacity tw-duration-300 tw-ease-linear",
          "data-[status=loaded]:tw-opacity-100 tw-object-cover"
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
        <JazzIcon seed={seed || alt || src || "litespace"} />
      </div>
    </div>
  );
};
