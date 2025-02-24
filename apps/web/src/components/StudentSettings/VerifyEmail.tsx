import { capture } from "@/lib/sentry";
import { VERIFY_EMAIL_CALLBACK_URL } from "@/lib/routes";
import { useSendVerifyEmail } from "@litespace/headless/auth";
import { Button } from "@litespace/ui/Button";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useCallback } from "react";

const VerifyEmail = () => {
  const intl = useFormatMessage();
  const toast = useToast();

  const onSuccess = useCallback(() => {
    toast.success({
      title: intl("student-settings.verify.success.title"),
      description: intl("student-settings.verify.success.description"),
    });
  }, [toast, intl]);

  const onError = useCallback(
    (error: unknown) => {
      const errorMessage = getErrorMessageId(error);
      capture(error);
      toast.error({
        title: intl("student-settings.verify.error.title"),
        description: intl(errorMessage),
      });
    },
    [toast, intl]
  );

  const mutation = useSendVerifyEmail({ onSuccess, onError });

  const sendVerifyEmail = useCallback(() => {
    mutation.mutate(VERIFY_EMAIL_CALLBACK_URL);
  }, [mutation]);

  return (
    <div className="flex flex-col gap-4">
      <Typography
        element="subtitle-2"
        weight="bold"
        className="text-natural-950"
      >
        {intl("student-settings.verify.title")}
      </Typography>
      <div className="flex flex-wrap gap-4 justify-between">
        <Typography
          element="body"
          className="text-natural-950 lg:max-w-[410px]"
        >
          {intl("student-settings.verify.description")}
        </Typography>
        <Button htmlType="button" size="large" onClick={sendVerifyEmail}>
          {intl("student-settings.verify.action")}
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmail;
