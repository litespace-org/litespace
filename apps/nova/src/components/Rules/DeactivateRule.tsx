import { useAppDispatch } from "@/redux/store";
import { findUserRules } from "@/redux/user/schedule";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useToast } from "@litespace/luna/Toast";
import { Dialog } from "@litespace/luna/Dialog";
import { Alert } from "@litespace/luna/Alert";
import { IRule } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useDeactivateRule } from "@litespace/headless/rule";
import { useUser } from "@litespace/headless/user-ctx";

const DeactivateRule: React.FC<{
  open?: boolean;
  close: () => void;
  rule: IRule.Self;
}> = ({ open, close, rule }) => {
  const intl = useFormatMessage();
  const dispatch = useAppDispatch();
  const { user } = useUser();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    if (user) dispatch(findUserRules.call(user.id));
    toast.success({
      title: intl("global.notify.schedule.update.success"),
    });
    close();
  }, [close, dispatch, intl, toast, user]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("global.notify.schedule.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const mutation = useDeactivateRule({ rule, onSuccess, onError });

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
        <ul className="flex flex-col gap-1 mb-1 list-disc list-inside">
          <li>{intl("page.schedule.deactivate.alert.description.1")}</li>
          <li>{intl("page.schedule.deactivate.alert.description.2")}</li>
        </ul>
      </Alert>
    </Dialog>
  );
};

export default DeactivateRule;
