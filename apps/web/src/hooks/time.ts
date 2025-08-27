import { dayjs } from "@litespace/utils";
import { useEffect, useState } from "react";

export function useCheckTimeValidity(): boolean {
  const [valid, setValid] = useState<boolean>(true);

  useEffect(() => {
    fetch(
      `https://timeapi.io/api/time/current/zone?timeZone=${dayjs.tz.guess()}`
    )
      .then((res) => res.json())
      .then((res) => setValid(res.hour === dayjs.tz().hour()));
  }, []);

  return valid;
}
