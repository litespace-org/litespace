import React, { useCallback, useState } from "react";
import cn from "classnames";
import Spinner from "@/icons/Spinner";
import { AlertCircle } from "react-feather";

enum Status {
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

export const Avatar: React.FC<{
  src?: string;
  alt?: string;
}> = ({ src, alt }) => {
  const [status, setStatus] = useState<Status>(Status.Loading);

  const onLoad = useCallback(() => {
    setStatus(Status.Loaded);
  }, []);

  const onError = useCallback(() => {
    setStatus(Status.Error);
  }, []);

  return (
    <div className="relative bg-surface-100 w-full h-full rounded-md overflow-hidden">
      <img
        data-status={status}
        className="opacity-0 transition-opacity duration-300 ease-linear data-[status=loaded]:opacity-100 object-cover"
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
      />

      <div
        data-status={status}
        className={cn(
          "absolute inset-0 w-full h-full flex items-center justify-center bg-destructive-200",
          "opacity-0 data-[status=error]:opacity-100 transition-opacity duration-300"
        )}
      >
        <AlertCircle className="text-destructive-600" />
      </div>

      <span
        data-status={status}
        className={cn(
          "opacity-100 transition-opacity duration-300 data-[status=loaded]:opacity-0 data-[status=error]:opacity-0",
          "absolute z-[1] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <Spinner className="text-foreground" />
      </span>
    </div>
  );
};
