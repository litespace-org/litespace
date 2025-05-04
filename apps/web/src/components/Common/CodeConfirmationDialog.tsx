import React, { useState } from "react";
import CheckCircle from "@litespace/assets/CheckCircle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { CodeConfirmationDialog } from "@litespace/ui/CodeConfirmationDialog";
import { useUserContext } from "@litespace/headless/context/user";
import {
  useConfirmEmailByCode,
  useSendEmailConfrimationCode,
} from "@litespace/headless/confirmationCode";
import { useToast } from "@litespace/ui/Toast";

const Component: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();
  const { user } = useUserContext();
  const [showCodeDialog, setShowCodeDialog] = useState(true);

  const resendEmail = useSendEmailConfrimationCode({
    onSuccess: () => {
      toast.success({ title: intl("verify-email.check-resend.success.title") });
      setShowCodeDialog(false);
    },
    onError: () => toast.error({ title: intl("error.api.unexpected") }),
  });

  const confirmEmail = useConfirmEmailByCode({
    onSuccess: () =>
      toast.success({ title: intl("email.confirmation-dialog.done") }),
    onError: () => toast.error({ title: intl("error.api.unexpected") }),
  });

  return user ? (
    <CodeConfirmationDialog
      open={!user?.verifiedEmail && showCodeDialog}
      title={intl("email.confirmation-dialog.title")}
      description={intl("email.confirmation-dialog.description")}
      icon={<CheckCircle />}
      actions={{
        primary: {
          label: intl("labels.confirm"),
          onClick: (code) => confirmEmail.mutate({ code }),
          disabled: confirmEmail.isPending || resendEmail.isPending,
          loading: confirmEmail.isPending,
        },
        secondary: {
          label: intl("labels.resend-code"),
          onClick: () => resendEmail.mutate({ email: user.email }),
          disabled: confirmEmail.isPending || resendEmail.isPending,
          loading: resendEmail.isPending,
        },
      }}
      close={() => setShowCodeDialog(false)}
      closable={!confirmEmail.isPending && !resendEmail.isPending}
    />
  ) : null;
};

export default Component;
