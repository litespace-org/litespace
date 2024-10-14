import { toaster } from "@/components/Toast";
import { atlas } from "@/lib/atlas";
import { IUser } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useFormatMessage } from "@/hooks/intl";
import { validateText } from "@/lib/validate";
import dayjs from "@/lib/dayjs";
import { MIN_AGE, MAX_AGE } from "@litespace/sol";
import { useRequired } from "@/hooks/validation";

export type RefreshUser = (user?: IUser.Self) => void;

function useUpdate(refresh: RefreshUser) {
  const intl = useFormatMessage();
  const onSuccess = useCallback(
    (user?: IUser.Self) => {
      refresh(user);
      toaster.success({ title: intl("profile.update.success") });
    },
    [intl, refresh]
  );

  const onError = useCallback(
    (error: Error) => {
      toaster.error({
        title: intl("profile.update.error"),
        description: error.message,
      });
    },
    [intl]
  );

  return { onSuccess, onError };
}

export function useUpdateUser(refresh: RefreshUser) {
  const { onSuccess, onError } = useUpdate(refresh);
  const update = useCallback(
    async ({
      id,
      payload,
    }: {
      id: number;
      payload: IUser.UpdateApiPayload;
    }) => {
      return await atlas.user.update(id, payload);
    },
    []
  );

  return useMutation({
    mutationFn: update,
    mutationKey: ["update-user"],
    onSuccess,
    onError,
  });
}

export function useUpdateProfileMedia(refresh: RefreshUser, user?: number) {
  const { onSuccess, onError } = useUpdate(refresh);
  const update = useCallback(
    async (payload: IUser.UpdateMediaPayload) => {
      if (!user) return;
      return await atlas.user.updateMedia(user, payload);
    },
    [user]
  );

  const mutation = useMutation({
    mutationFn: update,
    mutationKey: ["update-user-media"],
    onSuccess,
    onError,
  });

  return mutation;
}

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
