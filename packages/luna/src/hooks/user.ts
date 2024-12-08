// todo: should be removed
import { IUser } from "@litespace/types";
import { useCallback, useMemo } from "react";
import { useFormatMessage } from "@/hooks/intl";
import { validateText } from "@/lib/validate";
import dayjs from "@/lib/dayjs";
import { MIN_AGE, MAX_AGE } from "@litespace/sol/constants";
import { useRequired } from "@/hooks/validation";

export type RefreshUser = (user?: IUser.Self) => void;

const nameRegex = /^[\u0600-\u06FF\s]+$/;

export function useValidateName() {
  const intl = useFormatMessage();
  return useCallback(
    (value?: string) =>
      validateText({
        regex: nameRegex,
        errors: {
          min: intl("error.name.length.short"),
          max: intl("error.name.length.long"),
          match: intl("error.name.invalid"),
        },
        length: { min: 3, max: 50 },
        value: value || "",
      }),
    [intl]
  );
}

export function useValidateBirthYear() {
  const intl = useFormatMessage();
  const required = useRequired();

  const max = useMemo(() => dayjs().year() - MIN_AGE, []);
  const min = useMemo(() => dayjs().year() - MAX_AGE, []);

  const validate = useCallback(
    (value?: string) => {
      const year = Number(value);
      if (Number.isNaN(year)) return intl("error.birthYear.invalid");
      if (year < min) return intl("error.birthYear.old");
      if (year > max) return intl("error.birthYear.young");
      return true;
    },
    [intl, max, min]
  );

  return { min, max, validate, required };
}
