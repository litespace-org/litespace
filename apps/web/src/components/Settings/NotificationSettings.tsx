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
import { Typography } from "@litespace/ui/Typography";
import UnverifiedPhoneFragment from "@/components/Settings/UnverifiedPhoneFragment";

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
const NotificationSettings: React.FC<{
  id: number;
  notificationMethod: IUser.NotificationMethod | null;
  phone: string | null;
  verifiedWhatsApp: boolean;
  verifiedPhone: boolean;
}> = ({ id, notificationMethod, verifiedWhatsApp, phone, verifiedPhone }) => {
  const intl = useFormatMessage();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [sentCode, setSentCode] = useState<boolean>(false);
  const [unresolvedPhone, setUnresolvedPhone] = useState<boolean>(false);

  const invalidateQuery = useInvalidateQuery();
  const toast = useToast();

  const options = useMemo(
    () => [
      {
        label: intl("shared-settings.edit.notification.none"),
        value: 0,
      },
      {
        label: intl("shared-settings.edit.notification.whatsapp"),
        value: IUser.NotificationMethod.Whatsapp,
      },
    ],
    [intl]
  );

  const onUpdateUserSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onSendCodeSuccess = useCallback(() => {
    setSentCode(true);
    setUnresolvedPhone(false);
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onUpdateUserError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      if (messageId === "error.api.unresolved-phone") setUnresolvedPhone(true);
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
          notificationMethod: data.notificationMethod || null,
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

      const isVerificationNeeded =
        value === IUser.NotificationMethod.Whatsapp && !verifiedWhatsApp;

      if (isVerificationNeeded) setShowDialog(true);

      if (phone && isVerificationNeeded)
        sendPhoneCodeMutation.mutate({
          method: NOTIFICATION_METHOD_TO_NOTIFICATION_METHOD_LITERAL[value],
          phone,
        });
    },
    [form, phone, sendPhoneCodeMutation, verifiedWhatsApp]
  );

  if (!verifiedPhone) return <UnverifiedPhoneFragment />;

  return (
    <div className="md:max-w-[344px] lg:max-w-[400px] grow md:grow-0 h-full flex flex-col">
      <Typography
        tag="h2"
        className="hidden md:block text-subtitle-1 font-bold text-natural-950 mb-4 md:mb-6"
      >
        {intl("shared-settings.notification.title")}
      </Typography>
      {showDialog ? (
        <VerifyNotificationMethodDialog
          method={selectedMethod}
          unresolvedPhone={unresolvedPhone}
          close={() => setShowDialog(false)}
          phone={phone}
          sendCode={sendPhoneCodeMutation.mutate}
          sendingCode={sendPhoneCodeMutation.isPending}
          sentCode={sentCode}
          verifyCode={verifyPhoneCodeMutation.mutate}
          verifing={verifyPhoneCodeMutation.isPending}
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
