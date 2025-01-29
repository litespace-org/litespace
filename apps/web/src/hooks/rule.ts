import { messages } from "@litespace/ui/locales";
import { useToast } from "@litespace/ui/Toast";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useMutation } from "@tanstack/react-query";

export function useActivateRule() {
  const intl = useIntl();
  const toast = useToast();

  const onError = useCallback(
    (error: unknown) => {
      toast.error({
        title: intl.formatMessage({
          id: messages["global.notify.schedule.update.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl, toast]
  );

  const onSuccess = useCallback(async () => {}, []);

  const mutation = useMutation({
    mutationFn: useCallback(async () => {}, []),
    onSuccess,
    onError,
  });

  return mutation;
}
