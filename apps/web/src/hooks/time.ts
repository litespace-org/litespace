import { useEffect, useState } from "react";
import { dayjs } from "@litespace/utils";
import { useCurrentTZHour } from "@litespace/headless/time";

export function useCheckTimeValidity(): boolean {
  const [valid, setValid] = useState(true);

  const tzHourQuery = useCurrentTZHour(dayjs.tz.guess());

  useEffect(() => {
    setValid(
      tzHourQuery.data?.hour === dayjs.tz().hour() ||
        tzHourQuery.isPending ||
        // NOTE: errors are ignored. In case your considered to
        // remove this condition. Put in mind that if you didn't
        // remove the invalid-time-dialog from the <root> as well,
        // users will get stuck in the login page, as then this
        // query will have 403 error constantly.
        tzHourQuery.isError
    );
  }, [tzHourQuery.data, tzHourQuery.isPending, tzHourQuery.isError]);

  return valid;
}
