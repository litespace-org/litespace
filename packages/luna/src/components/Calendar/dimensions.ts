import { useMediaQueries } from "@/hooks/media";
import { useMemo } from "react";

export function useDimensions() {
  const { sm, md, lg, xl, xxl } = useMediaQueries();

  const width = useMemo(() => {
    if (xxl) return 205;
    if (xl) return 170;
    if (lg) return 130;
    if (md) return 100;
    if (sm) return 80;
    return 70;
  }, [lg, md, sm, xl, xxl]);

  const height = useMemo(() => {
    if (xxl) return 90;
    if (xl || lg) return 80;
    if (md || sm) return 60;
    return 50;
  }, [lg, md, sm, xl, xxl]);

  const dimensions = useMemo(() => {
    const hour = height;
    const minute = hour / 60;
    const childOffset = 0.05 * width;
    const childWidth = width - childOffset;
    const parentWidth = 0.8 * width;
    return {
      width,
      height,
      hour,
      minute,
      childWidth,
      parentWidth,
      childOffset,
    };
  }, [height, width]);

  return dimensions;
}
