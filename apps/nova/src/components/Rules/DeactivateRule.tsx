import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { findUserRules } from "@/redux/user/schedule";
import {
  Alert,
  Dialog,
  toaster,
  atlas,
  useFormatMessage,
} from "@litespace/luna";
import { IRule } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";

const DeactivateRule: React.FC<{
  open?: boolean;
  close: () => void;
  rule: IRule.Self;
}> = ({ open, close, rule }) => {
  const intl = useFormatMessage();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(profileSelectors.user);

  const onSuccess = useCallback(() => {
    if (profile) dispatch(findUserRules.call(profile.id));
    toaster.success({
      title: intl("global.notify.schedule.update.success"),
    });
    close();
  }, [close, dispatch, intl, profile]);

  const onError = useCallback(
    (error: Error) => {
      toaster.error({
        title: intl("global.notify.schedule.update.error"),
        description: error.message,
      });
    },
    [intl]
  );

  const mutation = useMutation({
    mutationFn: useCallback(async () => {
      return await atlas.rule.update(rule.id, { activated: false });
    }, [rule.id]),
    onSuccess,
    onError,
  });

  const action = useMemo(
    () => ({
      label: intl("page.schedule.deactivate.alert.button.label"),
      disabled: mutation.isPending,
      loading: mutation.isPending,
      onClick: mutation.mutate,
    }),
    [intl, mutation.isPending, mutation.mutate]
  );

  return (
    <Dialog
      open={open}
      close={close}
      title={intl("page.schedule.deactivate.dialog.title")}
    >
      <Alert
        title={intl("page.schedule.deactivate.alert.title", {
          title: rule.title,
        })}
        action={action}
      >
        <ul className="list-disc list-inside flex flex-col gap-1 mb-1">
          <li>{intl("page.schedule.deactivate.alert.description.1")}</li>
          <li>{intl("page.schedule.deactivate.alert.description.2")}</li>
        </ul>
      </Alert>
    </Dialog>
  );
};

export default DeactivateRule;
