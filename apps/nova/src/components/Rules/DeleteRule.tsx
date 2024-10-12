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

const DeleteRule: React.FC<{
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
      return await atlas.rule.delete(rule.id);
    }, [rule.id]),
    onSuccess,
    onError,
  });

  const action = useMemo(
    () => ({
      label: intl("page.schedule.delete.dialog.alert.button.label"),
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
      title={intl("page.schedule.delete.dialog.title")}
      className="w-full md:w-2/3 lg:w-1/2 xl:w-[40rem]"
    >
      <Alert
        title={intl("page.schedule.delete.dialog.alert.title", {
          title: rule.title,
        })}
        action={action}
      >
        <p>{intl("page.schedule.delete.dialog.alert.description.0")}</p>
        <ul className="list-disc list-inside flex flex-col gap-1">
          <li>{intl("page.schedule.delete.dialog.alert.description.1")}</li>
          <li>{intl("page.schedule.delete.dialog.alert.description.2")}</li>
        </ul>
      </Alert>
    </Dialog>
  );
};

export default DeleteRule;
