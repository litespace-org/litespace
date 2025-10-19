import { useEffect, useState } from "react";
import { dayjs } from "@litespace/utils";
import { useCurrentZoneTime } from "@litespace/headless/time";

export function useCheckTimeValidity(): boolean {
  const [valid, setValid] = useState(true);

  const tzQuery = useCurrentZoneTime(dayjs.tz.guess());

  useEffect(() => {
    setValid(
      dayjs().diff(tzQuery.data?.iso, "seconds") < 30 ||
        tzQuery.isPending ||
        // NOTE: errors are ignored. In case you considered to
        // remove this condition. Put in mind that if you didn't
        // remove the invalid-time-dialog from the <root> as well,
        // users will get stuck in the login page, as then this
        // query will have 403 error constantly.
        tzQuery.isError
    );
  }, [tzQuery.data, tzQuery.isPending, tzQuery.isError]);

  return valid;
}
