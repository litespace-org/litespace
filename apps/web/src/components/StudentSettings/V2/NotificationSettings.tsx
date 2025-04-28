import { useOnError } from "@/hooks/error";
import { QueryKey } from "@litespace/headless/constants";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateUser } from "@litespace/headless/user";
import { IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Select } from "@litespace/ui/Select";
import { useToast } from "@litespace/ui/Toast";
import { optional } from "@litespace/utils";
import { useCallback, useMemo } from "react";

export function NotificationSettings({
  id,
  notificationMethod,
  verifiedTelegram,
  verifiedWhatsApp,
}: {
  id: number;
  notificationMethod: IUser.NotificationMethod | null;
  verifiedWhatsApp: boolean;
  verifiedTelegram: boolean;
}) {
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const options = useMemo(
    () => [
      {
        label: intl("student-settings.edit.notification.whatsapp"),
        value: IUser.NotificationMethod.Whatsapp,
      },
      {
        label: intl("student-settings.edit.notification.telegram"),
        value: IUser.NotificationMethod.Telegram,
      },
    ],
    [intl]
  );

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.update.error"),
        description: intl(messageId),
      });
    },
  });

  const mutation = useUpdateUser({ onSuccess, onError });

  const form = useForm<{
    notificationMethod: IUser.Self["notificationMethod"];
  }>({
    defaults: {
      notificationMethod: notificationMethod,
    },
    onSubmit: (data) => {
      mutation.mutate({
        id,
        payload: {
          notificationMethod: data.notificationMethod,
        },
      });
    },
  });

  return (
    <div>
      <form onSubmit={form.onSubmit} className="max-w-[400px]">
        <Select
          onChange={(value) => {
            if (
              value === IUser.NotificationMethod.Whatsapp &&
              !verifiedWhatsApp
            )
              return alert("verify whatsapp first");

            if (
              value === IUser.NotificationMethod.Telegram &&
              !verifiedTelegram
            )
              return alert("verify telegram first");

            form.set("notificationMethod", value);
          }}
          id="notification-method"
          label={intl("student-settings.edit.notification.label")}
          placeholder={intl("student-settings.edit.notification.placeholder")}
          value={optional(form.state.notificationMethod)}
          options={options}
        />
      </form>
      <Button
        size="large"
        disabled={mutation.isPending}
        onClick={form.submit}
        className="mt-10"
      >
        {intl("shared-settings.save")}
      </Button>
    </div>
  );
}
