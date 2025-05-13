import { VerifyNotificationMethodDialog } from "@/components/VerifyNotificationMethodDialog";
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
import {
  NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL,
  optional,
} from "@litespace/utils";
import { useCallback, useMemo, useState } from "react";
import {
  useSendPhoneCode,
  useVerifyPhoneCode,
} from "@litespace/headless/confirmationCode";

type Form = {
  notificationMethod: IUser.Self["notificationMethod"];
};

/**
 * There are 3 scenarios in this form component:
 * 1. The user has a phone number and has verified method -> user can select the method directly and
 * submit changes -> update the user directly using `useUpdateUser`.
 *
 * 2. The user has phone and doesn't have verified method -> user can select a method which opens the dialog
 * and it will send automatically the code to the selected method -> user enters the code sent to him
 * this will verify the method and update it automatically.
 *
 * 3. The user doesn't have a phone number nor a verified method -> user will need to select the method ->
 * opens the dialog automatically and he needs to enter the number -> this will save his number then he needs
 * to enter the code sent to him.
 */
export function NotificationSettings({
  id,
  notificationMethod,
  verifiedTelegram,
  verifiedWhatsApp,
  phone,
}: {
  id: number;
  notificationMethod: IUser.NotificationMethod | null;
  phone: string | null;
  verifiedWhatsApp: boolean;
  verifiedTelegram: boolean;
}) {
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [sentCode, setSentCode] = useState<boolean>(false);

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

  const onUpdateUserSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onSendCodeSuccess = useCallback(() => {
    setSentCode(true);
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

  const onSendCodeError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.send-code.error"),
        description: intl(messageId),
      });
    },
  });

  const onVerifySuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    setShowDialog(false);
    setSentCode(false);
    toast.success({
      title: intl("shared-settings.verify-code.success"),
    });
  }, [invalidateQuery, intl, toast]);

  const onVerifyCodeError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.verify-code.error"),
        description: intl(messageId),
      });
    },
  });

  const updateUserMutation = useUpdateUser({
    onSuccess: onUpdateUserSuccess,
    onError: onUpdateUserError,
  });

  const sendPhoneCodeMutation = useSendPhoneCode({
    onSuccess: onSendCodeSuccess,
    onError: onSendCodeError,
  });
  const verifyPhoneCodeMutation = useVerifyPhoneCode({
    onSuccess: onVerifySuccess,
    onError: onVerifyCodeError,
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

  const onChange = useCallback(
    (value: IUser.NotificationMethod) => {
      form.set("notificationMethod", value);

      const verificationNeeded =
        (value === IUser.NotificationMethod.Whatsapp && !verifiedWhatsApp) ||
        (value === IUser.NotificationMethod.Telegram && !verifiedTelegram);

      if (verificationNeeded) setShowDialog(true);

      if (phone && verificationNeeded)
        sendPhoneCodeMutation.mutate({
          method: NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL[value],
          phone,
        });
    },
    [form, phone, sendPhoneCodeMutation, verifiedTelegram, verifiedWhatsApp]
  );

  return (
    <div className="md:max-w-[344px] lg:max-w-[400px] grow md:grow-0 h-full flex flex-col">
      {showDialog ? (
        <VerifyNotificationMethodDialog
          method={selectedMethod}
          close={() => setShowDialog(false)}
          phone={phone}
          sendCode={sendPhoneCodeMutation.mutate}
          sendingCode={sendPhoneCodeMutation.isPending}
          sentCode={sentCode}
          verifyCode={verifyPhoneCodeMutation.mutate}
          verifing={verifyPhoneCodeMutation.isPending}
        />
      ) : null}
      <form onSubmit={form.onSubmit} className="grow flex flex-col gap-6">
        <Select
          onChange={onChange}
          id="notification-method"
          label={intl("student-settings.edit.notification.label")}
          placeholder={intl("student-settings.edit.notification.placeholder")}
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
        >
          {intl("shared-settings.save")}
        </Button>
      </form>
      <Button
        size="large"
        disabled={updateUserMutation.isPending}
        onClick={form.submit}
        className="mt-auto md:mt-10 mr-auto md:mr-0"
      >
        {intl("shared-settings.save")}
      </Button>
    </div>
  );
}
