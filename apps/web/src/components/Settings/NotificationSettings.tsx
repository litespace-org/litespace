import VerifyNotifications from "@/components/Common/VerifyNotifications";
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
import { Typography } from "@litespace/ui/Typography";
import {
  NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL,
  optional,
} from "@litespace/utils";
import { useCallback, useMemo, useState } from "react";

type Form = {
  notificationMethod: IUser.Self["notificationMethod"];
};

/**
 * There are 3 scenarios in this form component:
 * 1. The user has a phone number and has verified method -> user can select the method directly and
 * submit changes -> update the user directly using `useUpdateUser`.
 *
 * 2. The user has phone and doesn't have verified method -> user can select a method which opens the dialog
 * -> user will confirm his phone -> user enters the code sent to him
 * this will verify the method and update it automatically.
 *
 * 3. The user doesn't have a phone number nor a verified method -> user will need to select the method ->
 * opens the dialog automatically and he needs to enter the number -> this will save his number then he needs
 * to enter the code sent to him.
 */
const NotificationSettings: React.FC<{
  id: number;
  notificationMethod: IUser.NotificationMethod | null;
  phone: string | null;
  verifiedWhatsApp: boolean;
  verifiedTelegram: boolean;
}> = ({
  id,
  notificationMethod,
  verifiedTelegram,
  verifiedWhatsApp,
  phone,
}) => {
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const options = useMemo(
    () => [
      {
        label: intl("shared-settings.edit.notification.whatsapp"),
        value: IUser.NotificationMethod.Whatsapp,
      },
      {
        label: intl("shared-settings.edit.notification.telegram"),
        value: IUser.NotificationMethod.Telegram,
      },
    ],
    [intl]
  );

  const onUpdateUserSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onUpdateUserError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.update-notification.error"),
        description: intl(messageId),
      });
    },
  });

  const updateUserMutation = useUpdateUser({
    onSuccess: onUpdateUserSuccess,
    onError: onUpdateUserError,
  });

  const form = useForm<Form>({
    defaults: { notificationMethod },
    onSubmit: (data) => {
      updateUserMutation.mutate({
        id,
        payload: {
          notificationMethod: data.notificationMethod,
        },
      });
    },
  });

  const selectedMethod = useMemo(() => {
    if (!form.state.notificationMethod) return null;
    return NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL[
      form.state.notificationMethod
    ];
  }, [form]);

  const isVerifiedMethod = useCallback(
    (val: IUser.NotificationMethod | null) => {
      if (val === null) return false;
      return (
        (val === IUser.NotificationMethod.Whatsapp && !verifiedWhatsApp) ||
        (val === IUser.NotificationMethod.Telegram && !verifiedTelegram)
      );
    },
    [verifiedTelegram, verifiedWhatsApp]
  );

  const onChange = useCallback(
    (value: IUser.NotificationMethod) => {
      form.set("notificationMethod", value);
      if (isVerifiedMethod(value)) setShowDialog(true);
    },
    [form, isVerifiedMethod]
  );

  return (
    <div className="md:max-w-[344px] lg:max-w-[400px] grow md:grow-0 h-full flex flex-col">
      <Typography
        tag="h2"
        className="text-subtitle-1 font-bold text-natural-950 mb-4 md:mb-6"
      >
        {intl("shared-settings.notification.title")}
      </Typography>
      {showDialog ? (
        <VerifyNotifications
          close={() => setShowDialog(false)}
          phone={phone}
          selectedMethod={selectedMethod}
        />
      ) : null}
      <form onSubmit={form.onSubmit} className="grow flex flex-col">
        <Select
          onChange={onChange}
          id="notification-method"
          label={intl("shared-settings.edit.notification.label")}
          placeholder={intl("shared-settings.edit.notification.placeholder")}
          value={optional(form.state.notificationMethod)}
          options={options}
        />
        <Button
          size="large"
          disabled={
            updateUserMutation.isPending ||
            form.state.notificationMethod === notificationMethod
          }
          onClick={form.submit}
          className="mt-6"
        >
          {intl("shared-settings.save")}
        </Button>
      </form>
    </div>
  );
};

export default NotificationSettings;
