import { toaster } from "@/components/Toast";
import { atlas } from "@/lib/atlas";
import { IUser } from "@litespace/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useFormatMessage } from "@/hooks/intl";
import { validateText } from "@/lib/validate";

export function useUpdateUser() {
  const intl = useFormatMessage();
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

  const onSuccess = useCallback(() => {
    toaster.success({
      title: intl("profile.update.success"),
    });
  }, [intl]);

  const onError = useCallback(
    (error: Error) => {
      toaster.error({
        title: intl("profile.update.error"),
        description: error.message,
      });
    },
    [intl]
  );

  return useMutation({
    mutationFn: update,
    mutationKey: ["update-user"],
    onSuccess,
    onError,
  });
}

const nameRegex = /^[\u0600-\u06FF\s]+$/;

export function useValidateName() {
  const intl = useFormatMessage();
  return useCallback(
    (value: string) =>
      validateText({
        regex: nameRegex,
        errors: {
          min: intl("error.name.length.short"),
          max: intl("error.name.length.long"),
          match: intl("error.name.invalid"),
        },
        length: { min: 3, max: 50 },
        value,
      }),
    [intl]
  );
}
