import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useToast } from "@litespace/luna/Toast";
import { Dialog } from "@litespace/luna/Dialog";
import { Alert } from "@litespace/luna/Alert";
import { IRule } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useDeleteRule } from "@litespace/headless/rule";

const DeleteRule: React.FC<{
  open?: boolean;
  close: () => void;
  rule: IRule.Self;
}> = ({ open, close, rule }) => {
  const intl = useFormatMessage();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("global.notify.schedule.update.success"),
    });
    close();
  }, [close, intl, toast]);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("global.notify.schedule.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const mutation = useDeleteRule({ rule, onSuccess, onError });

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
        <ul className="flex flex-col gap-1 list-disc list-inside">
          <li>{intl("page.schedule.delete.dialog.alert.description.1")}</li>
          <li>{intl("page.schedule.delete.dialog.alert.description.2")}</li>
        </ul>
      </Alert>
    </Dialog>
  );
};

export default DeleteRule;
