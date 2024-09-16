import { atlas } from "@/lib/atlas";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { findUserRules } from "@/redux/user/schedule";
import { Alert, Dialog, messages, toaster } from "@litespace/luna";
import { IRule } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useMutation } from "@tanstack/react-query";

const DeactivateRule: React.FC<{
  open?: boolean;
  close: () => void;
  rule: IRule.Self;
}> = ({ open, close, rule }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(profileSelector);

  const onSuccess = useCallback(() => {
    if (profile) dispatch(findUserRules.call(profile.id));
    toaster.success({
      title: intl.formatMessage({
        id: messages["global.notify.schedule.update.success"],
      }),
    });
    close();
  }, [close, dispatch, intl, profile]);

  const onError = useCallback(
    (error: unknown) => {
      toaster.error({
        title: intl.formatMessage({
          id: messages["global.notify.schedule.update.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
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
      label: intl.formatMessage({
        id: messages["page.schedule.deactivate.alert.button.label"],
      }),
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
      title={intl.formatMessage({
        id: messages["page.schedule.deactivate.dialog.title"],
      })}
    >
      <Alert
        title={intl.formatMessage(
          { id: messages["page.schedule.deactivate.alert.title"] },
          { title: rule.title }
        )}
        action={action}
      >
        <ul className="list-disc list-inside flex flex-col gap-1 mb-1">
          <li>
            {intl.formatMessage({
              id: messages["page.schedule.deactivate.alert.description.1"],
            })}
          </li>
          <li>
            {intl.formatMessage({
              id: messages["page.schedule.deactivate.alert.description.1"],
            })}
          </li>
        </ul>
      </Alert>
    </Dialog>
  );
};

export default DeactivateRule;
