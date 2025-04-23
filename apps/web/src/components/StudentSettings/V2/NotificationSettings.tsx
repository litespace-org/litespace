import { useOnError } from "@/hooks/error";
import { QueryKey } from "@litespace/headless/constants";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateUser } from "@litespace/headless/user";
import { Element, IUser } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Select } from "@litespace/ui/Select";
import { useToast } from "@litespace/ui/Toast";
import { useCallback, useMemo } from "react";

function canSubmit(
  initial: IUser.NotificationMethod | null,
  current: IUser.NotificationMethod | null
) {
  return initial !== current;
}

// select can't have a null value, so I am using 0 to represent it
const NO_USER_NOTIFICATION_METHOD = 0;

export function NotificationSettings({
  id,
  notificationMethod,
}: {
  id: number;
  notificationMethod: IUser.Self["notificationMethod"];
}) {
  const intl = useFormatMessage();
  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const options = useMemo(
    () => [
      {
        label: intl("student-settings.edit.notification.none"),
        value: NO_USER_NOTIFICATION_METHOD,
        default: true,
      },
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

  const onChange = useCallback(
    (val: Element<typeof options>["value"]) => {
      if (val === NO_USER_NOTIFICATION_METHOD) {
        form.set("notificationMethod", null);
        return;
      }
      form.set("notificationMethod", val);
    },
    [form]
  );

  return (
    <div>
      <Form onSubmit={form.onFormSubmit} className="max-w-[400px]">
        <Select
          onChange={onChange}
          id="notification-method"
          label={intl("student-settings.edit.notification.title")}
          value={form.state.notificationMethod || NO_USER_NOTIFICATION_METHOD}
          options={options}
        />
      </Form>
      <Button
        size="large"
        disabled={
          mutation.isPending ||
          !canSubmit(form.state.notificationMethod, notificationMethod)
        }
        onClick={form.submit}
        className="mt-10"
      >
        {intl("shared-settings.save")}
      </Button>
    </div>
  );
}
