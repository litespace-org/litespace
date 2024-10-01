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
}> = ({ image, user, refresh }) => {
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
      className={cn(
        "relative",
        "rounded-full w-full h-full aspect-square overflow-hidden",
        "ring-4 ring-background-selection bg-background-selection",
        "focus:outline-none focus:ring-brand focus:ring-2"
      )}
    >
      <div
        data-show={mutation.isPending}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "hidden data-[show=true]:block"
        )}
      >
        <Spinner className="text-foreground" />
      </div>
      <input
        accept="image/png, image/jpeg"
        onChange={onChange}
        className="hidden"
        name="image"
        type="file"
        id="image"
        ref={ref}
      />
      <img
        className={cn("inline-block object-cover w-full h-full")}
        src={image ? asFullAssetUrl(image) : "/avatar-1.png"}
      />

      <div
        className={cn(
          "absolute bottom-0 left-0 w-full h-10 z-10",
          "bg-white/40 hover:bg-white/50 dark:bg-black/40 dark:hover:bg-black/50",
          "transition-colors duration-300 ease-linear",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
        )}
      >
        <Camera className="text-white/80" />
      </div>
    </button>
  );
};

export default Image;
