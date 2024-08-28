import React, { useEffect, useMemo, useState } from "react";
import { useDimensions } from "@/components/Calendar/dimensions";
import dayjs from "@/lib/dayjs";
import cn from "classnames";
import { asArabicDayIndex } from "@/lib/time";

const Indicator: React.FC = () => {
  const [now, setNow] = useState(dayjs());
  const dimensions = useDimensions();
  const mintues = useMemo(() => now.hour() * 60 + now.minute(), [now]);
  const arabicDayIndex = useMemo(() => asArabicDayIndex(now.day()), [now]);

  useEffect(() => {
    const interval = setInterval(
      () => setNow(dayjs()),
      1000 * 60 // 1 minute
    );
    return () => clearInterval(interval);
  }, []);

  const style = useMemo(
    (): React.HtmlHTMLAttributes<HTMLSpanElement>["style"] => ({
      width: dimensions.width,
      top: mintues * dimensions.minute,
      right: arabicDayIndex * dimensions.width,
    }),
    [arabicDayIndex, dimensions.minute, dimensions.width, mintues]
  );
  return (
    <span
      style={style}
      className={cn(
        "absolute z-[1000] bg-destructive-600 h-0.5 rounded-full",
        "after:content-[''] after:absolute after:inline-block after:w-2.5 after:h-2.5 after:rounded-full ",
        "after:bg-destructive-600 after:-top-1 after:right-0"
      )}
    />
  );
};

export default Indicator;
