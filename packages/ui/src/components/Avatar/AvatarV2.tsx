"use client";

import Logo from "@litespace/assets/LogoAvatarV2";
import React, { useMemo, useCallback, useState } from "react";
import cn from "classnames";
import { optional } from "@litespace/utils";

type Status = "loading" | "loaded" | "error";

const COLOR_STYLES = [
  // green
  "[&>svg>[data-id=colored]]:fill-avatar-green-1 bg-avatar-green-1",
  "[&>svg>[data-id=colored]]:fill-avatar-green-2 bg-avatar-green-2",
  "[&>svg>[data-id=colored]]:fill-avatar-green-3 bg-avatar-green-3",
  "[&>svg>[data-id=colored]]:fill-avatar-green-4 bg-avatar-green-4",
  // blue
  "[&>svg>[data-id=colored]]:fill-avatar-blue-1 bg-avatar-blue-1",
  "[&>svg>[data-id=colored]]:fill-avatar-blue-2 bg-avatar-blue-2",
  "[&>svg>[data-id=colored]]:fill-avatar-blue-3 bg-avatar-blue-3",
  "[&>svg>[data-id=colored]]:fill-avatar-blue-4 bg-avatar-blue-4",
  // pink
  "[&>svg>[data-id=colored]]:fill-avatar-pink-1 bg-avatar-pink-1",
  "[&>svg>[data-id=colored]]:fill-avatar-pink-2 bg-avatar-pink-2",
  "[&>svg>[data-id=colored]]:fill-avatar-pink-3 bg-avatar-pink-3",
  "[&>svg>[data-id=colored]]:fill-avatar-pink-4 bg-avatar-pink-4",
  // redish
  "[&>svg>[data-id=colored]]:fill-avatar-redish-1 bg-avatar-redish-1",
  "[&>svg>[data-id=colored]]:fill-avatar-redish-2 bg-avatar-redish-2",
  "[&>svg>[data-id=colored]]:fill-avatar-redish-3 bg-avatar-redish-3",
  "[&>svg>[data-id=colored]]:fill-avatar-redish-4 bg-avatar-redish-4",
  // violate
  "[&>svg>[data-id=colored]]:fill-avatar-violate-1 bg-avatar-violate-1",
  "[&>svg>[data-id=colored]]:fill-avatar-violate-2 bg-avatar-violate-2",
  "[&>svg>[data-id=colored]]:fill-avatar-violate-3 bg-avatar-violate-3",
  "[&>svg>[data-id=colored]]:fill-avatar-violate-4 bg-avatar-violate-4",
];

export const AvatarV2: React.FC<{
  src?: string | null;
  alt?: string | null;
  id?: number | null;
  object?: "fill" | "contain" | "cover" | "none" | "scale-down";
}> = ({ src, alt, id, object = "cover" }) => {
  const [status, setStatus] = useState<Status>("loading");

  const onLoad = useCallback(() => {
    setStatus("loaded");
  }, []);

  const onError = useCallback(() => {
    setStatus("error");
  }, []);

  const mod = useMemo(() => {
    return Math.floor((id || 0) % COLOR_STYLES.length);
  }, [id]);

  return (
    <div data-mod={mod} className="relative w-full h-full overflow-hidden">
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
        src={optional(src)}
        alt={optional(alt)}
        onLoad={onLoad}
        onError={onError}
      />
      <div
        data-status={status}
        className={cn(
          "opacity-100 transition-opacity duration-300",
          "data-[status=loaded]:opacity-0",
          "absolute top-0 left-0 w-full h-full z-chat-avatar",
          COLOR_STYLES[mod]
        )}
      >
        <Logo className="w-full h-full" />
      </div>
    </div>
  );
};
