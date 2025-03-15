import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useCallback, useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";

type CalendarView = "week" | "4-days";

export function useCalendarController() {
  const mq = useMediaQuery();
  const view = useMemo((): CalendarView => {
    if (mq.xl || !mq.md) return "week";
    return "4-days";
  }, [mq.xl, mq.md]);

  const interval = useMemo(() => (view === "week" ? 7 : 4), [view]);

  const [start, setStart] = useState(() =>
    dayjs().startOf(view === "week" ? "week" : "day")
  );

  const end = useMemo(() => {
    return start.add(interval, "days");
  }, [start, interval]);

  const next = useCallback(() => {
    setStart((prev) => prev.add(interval, "days"));
  }, [interval]);

  const prev = useCallback(() => {
    setStart((prev) => prev.subtract(interval, "days"));
  }, [interval]);

  return {
    start,
    end,
    next,
    prev,
    view,
  };
}
