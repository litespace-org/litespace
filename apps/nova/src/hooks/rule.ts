import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { setUserRules } from "@/redux/user/schedule";
import { messages } from "@litespace/luna/locales";
import { useToast } from "@litespace/luna/Toast";
import { atlas } from "@litespace/luna/backend";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { useMutation } from "@tanstack/react-query";

export function useActivateRule(ruleId: number) {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(profileSelectors.user);
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

  const onSuccess = useCallback(async () => {
    if (!profile) return;
    await atlas.rule
      .findUserRules(profile.id)
      .then((rules) => dispatch(setUserRules(rules)))
      .catch(onError);
  }, [dispatch, onError, profile]);

  const mutation = useMutation({
    mutationFn: useCallback(
      async () => await atlas.rule.update(ruleId, { activated: true }),
      [ruleId]
    ),
    onSuccess,
    onError,
  });

  return mutation;
}
