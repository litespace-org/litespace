import { useSendVerifyEmail } from "@litespace/headless/auth";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { useCallback, useEffect, useState } from "react";
import { CALLBACK_URL } from "@/types/routes";

const CheckEmail = () => {
  const intl = useFormatMessage();
  const toast = useToast();
  const [sentFirstTime, setSentFirstTime] = useState(false);

  const onSuccess = useCallback(() => {}, []);

  const onError = useCallback(() => {
    toast.error({
      title: intl("page.check.email.resend.error"),
    });
  }, [toast, intl]);

  const verifyMutation = useSendVerifyEmail({ onSuccess, onError });

  const sendEmail = useCallback(
    () => verifyMutation.mutate(CALLBACK_URL),
    [verifyMutation]
  );

  useEffect(() => {
    if (sentFirstTime) return;
    sendEmail();
    setSentFirstTime(true);
  }, [sentFirstTime, sendEmail]);

  return (
    <div className="flex flex-col gap-6 justify-center items-center text-center grow">
      <div className="flex flex-col gap-2">
        <Typography
          element={"h4"}
          weight="semibold"
          className="text-natural-950"
        >
          {intl("page.check.email.title")}{" "}
        </Typography>
        <Typography element="body" className="text-natural-700 max-w-[554px]">
          {intl("page.check.email.description")}{" "}
        </Typography>
      </div>
      <Button
        onClick={sendEmail}
        loading={verifyMutation.isPending}
        variant={"tertiary"}
      >
        {intl("page.check.email.resend")}
      </Button>
    </div>
  );
};

export default CheckEmail;
