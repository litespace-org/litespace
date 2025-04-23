"use client";

import Logo from "@litespace/assets/LogoV2";
import React, { useMemo, useCallback, useState } from "react";
import cn from "classnames";
import { orUndefined } from "@litespace/utils";

type Status = "loading" | "loaded" | "error";

const COLOR_STYLES = [
  // green
  "[&>[data-id=colored]]:fill-[oklch(0.86_0.2739_144.75)]",
  "[&>[data-id=colored]]:fill-[oklch(0.81_0.2728_144.75)]",
  "[&>[data-id=colored]]:fill-[oklch(0.79_0.2871_148.23)]",
  "[&>[data-id=colored]]:fill-[oklch(0.69_0.2491_148.23)]",
  // blue
  "[&>[data-id=colored]]:fill-[oklch(0.56_0.2509_257.98)]",
  "[&>[data-id=colored]]:fill-[oklch(0.55_0.2124_257.98)]",
  "[&>[data-id=colored]]:fill-[oklch(0.51_0.2171_257.98)]",
  "[&>[data-id=colored]]:fill-[oklch(0.48_0.2871_268.94)]",
  // pink
  "[&>[data-id=colored]]:fill-[oklch(0.74_0.2937_335.64)]",
  "[&>[data-id=colored]]:fill-[oklch(0.7_0.3332_335.64)]",
  "[&>[data-id=colored]]:fill-[oklch(0.65_0.3069_335.64)]",
  "[&>[data-id=colored]]:fill-[oklch(0.68_0.3003_335.64)]",
  // redish
  "[&>[data-id=colored]]:fill-[oklch(0.71_0.2311_36.85)]",
  "[&>[data-id=colored]]:fill-[oklch(0.68_0.2311_36.85)]",
  "[&>[data-id=colored]]:fill-[oklch(0.68_0.2487_36.85)]",
  "[&>[data-id=colored]]:fill-[oklch(0.65_0.241_36.85)]",
  // orange
  "[&>[data-id=colored]]:fill-[oklch(0.79_0.2002_65.65)]",
  "[&>[data-id=colored]]:fill-[oklch(0.74_0.1893_65.65)]",
  "[&>[data-id=colored]]:fill-[oklch(0.82_0.1969_77.29)]",
  "[&>[data-id=colored]]:fill-[oklch(0.77_0.1861_63.53)]",
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

  console.log({ status });

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
        <Logo className={COLOR_STYLES[mod]} />
      </div>
    </div>
  );
};
