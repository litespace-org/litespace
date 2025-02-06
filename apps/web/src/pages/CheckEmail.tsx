import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import { useSendVerifyEmail } from "@litespace/headless/auth";
import { Button, ButtonVariant } from "@litespace/ui/Button";
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
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col text-center items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <div className="flex flex-col gap-6 justify-center items-center grow">
          <div className="flex flex-col gap-2">
            <Typography
              element={"h4"}
              weight="semibold"
              className="text-natural-950"
            >
              {intl("page.check.email.title")}{" "}
            </Typography>
            <Typography
              element="body"
              className="text-natural-700 max-w-[554px]"
            >
              {intl("page.check.email.description")}{" "}
            </Typography>
          </div>
          <Button
            onClick={sendEmail}
            loading={verifyMutation.isPending}
            variant={ButtonVariant.Tertiary}
          >
            {intl("page.check.email.resend")}
          </Button>
        </div>
      </main>
      <Aside />
    </div>
  );
};

export default CheckEmail;
