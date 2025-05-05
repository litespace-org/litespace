"use client";

import Logo from "@litespace/assets/LogoV2";
import React, { useMemo, useCallback, useState } from "react";
import cn from "classnames";
import { optional } from "@litespace/utils";

type Status = "loading" | "loaded" | "error";

const COLOR_STYLES = [
  // green
  "[&>[data-id=colored]]:fill-[oklch(0.57_0.2311_144.75)]",
  "[&>[data-id=colored]]:fill-[oklch(0.62_0.2467_144.75)]",
  "[&>[data-id=colored]]:fill-[oklch(0.65_0.2742_144.75)]",
  "[&>[data-id=colored]]:fill-[oklch(0.69_0.2491_148.23)]",
  // blue
  "[&>[data-id=colored]]:fill-[oklch(0.56_0.2509_257.98)]",
  "[&>[data-id=colored]]:fill-[oklch(0.55_0.2124_257.98)]",
  "[&>[data-id=colored]]:fill-[oklch(0.51_0.2171_257.98)]",
  "[&>[data-id=colored]]:fill-[oklch(0.48_0.2871_268.94)]",
  // pink
  "[&>[data-id=colored]]:fill-[oklch(0.55_0.2687_335.64)]",
  "[&>[data-id=colored]]:fill-[oklch(0.59_0.2837_335.64)]",
  "[&>[data-id=colored]]:fill-[oklch(0.63_0.3009_335.64)]",
  "[&>[data-id=colored]]:fill-[oklch(0.64_0.3145_335.64)]",
  // redish
  "[&>[data-id=colored]]:fill-[oklch(0.54_0.1998_36.85)]",
  "[&>[data-id=colored]]:fill-[oklch(0.6_0.2252_36.85)]",
  "[&>[data-id=colored]]:fill-[oklch(0.63_0.2383_36.85)]",
  "[&>[data-id=colored]]:fill-[oklch(0.65_0.241_36.85)]",
  // violate
  "[&>[data-id=colored]]:fill-[oklch(0.49_0.2541_308.19)]",
  "[&>[data-id=colored]]:fill-[oklch(0.55_0.2938_308.19)]",
  "[&>[data-id=colored]]:fill-[oklch(0.58_0.3112_308.19)]",
  "[&>[data-id=colored]]:fill-[oklch(0.6_0.3009_308.19)]",
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
    return Math.floor((id || 0) % (COLOR_STYLES.length + 1));
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
          "absolute top-0 left-0 w-full h-full z-chat-avatar"
        )}
      >
        <Logo className={COLOR_STYLES[mod]} />
      </div>
    </div>
  );
};
