import React, { useCallback, useState } from "react";
import cn from "classnames";
import { Spinner } from "@/icons/Spinner";
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
    <div className="tw-relative tw-bg-surface-100 tw-w-full tw-h-full tw-rounded-md tw-overflow-hidden">
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
          "tw-absolute tw-inset-0 tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-bg-destructive-200",
          "tw-opacity-0 data-[status=error]:tw-opacity-100 tw-transition-opacity tw-duration-300"
        )}
      >
        <AlertCircle className="tw-text-destructive-600" />
      </div>

      <span
        data-status={status}
        className={cn(
          "tw-opacity-100 tw-transition-opacity tw-duration-300",
          "data-[status=loaded]:tw-opacity-0 data-[status=error]:tw-opacity-0",
          "tw-absolute tw-z-[1] tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2"
        )}
      >
        <Spinner className="tw-text-foreground" />
      </span>
    </div>
  );
};
