import { useEffect, useState } from "react";
import { dayjs } from "@litespace/utils";
import { useCurrentTZHour } from "@litespace/headless/time";

export function useCheckTimeValidity(): boolean {
  const [valid, setValid] = useState(true);

  const tzHourQuery = useCurrentTZHour(dayjs.tz.guess());

  useEffect(() => {
    setValid(
      tzHourQuery.data?.hour === dayjs.tz().hour() || tzHourQuery.isPending
    );
  }, [tzHourQuery.data, tzHourQuery.isPending]);

  return valid;
}
