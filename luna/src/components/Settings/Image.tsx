import { asFullAssetUrl } from "@/lib/atlas";
import React, { useCallback, useRef } from "react";
import cn from "classnames";
import { Camera } from "react-feather";
import Spinner from "@/icons/Spinner";
import { RefreshUser, useUpdateProfileMedia } from "@/hooks";

const Image: React.FC<{
  image?: string | null;
  user?: number;
  refresh: RefreshUser;
  displayOnly?: boolean;
  className?: string;
}> = ({ image, user, displayOnly, refresh, className }) => {
  const ref = useRef<HTMLInputElement>(null);

  const open = useCallback(() => {
    if (!ref.current) return;
    ref.current.click();
  }, []);

  const mutation = useUpdateProfileMedia(refresh, user);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      return mutation.mutate({ image: file });
    },
    [mutation]
  );

  return (
    <button
      type="button"
      onClick={open}
      disabled={displayOnly}
      className={cn(
        "tw-relative",
        "tw-rounded-full tw-aspect-square tw-overflow-hidden",
        "tw-ring-4 tw-ring-background-selection tw-bg-background-selection",
        "tw-focus:outline-none focus:tw-ring-brand focus:tw-ring-2",
        className
      )}
    >
      <div
        data-show={mutation.isPending}
        className={cn(
          "tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2",
          "tw-hidden data-[show=true]:tw-block"
        )}
      >
        <Spinner className="tw-text-foreground" />
      </div>
      <input
        accept="image/png, image/jpeg"
        onChange={onChange}
        className="tw-hidden"
        name="image"
        type="file"
        id="image"
        ref={ref}
      />
      <img
        className={cn("tw-inline-block tw-object-cover tw-w-full tw-h-full")}
        src={image ? asFullAssetUrl(image) : "/avatar-1.png"}
      />

      <div
        data-show={!displayOnly}
        className={cn(
          "tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-h-10 tw-z-10",
          "tw-bg-white/40 hover:tw-bg-white/50 dark:tw-bg-black/40 dark:hover:tw-bg-black/50",
          "tw-transition-colors tw-duration-300 tw-ease-linear",
          "tw-hidden data-[show=true]:tw-flex tw-items-center tw-justify-center",
          "focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-brand disabled:tw-opacity-50"
        )}
      >
        <Camera className="tw-text-white/80" />
      </div>
    </button>
  );
};

export default Image;
