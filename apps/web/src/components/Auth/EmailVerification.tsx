import React from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Loader } from "@litespace/ui/Loading";
import { Void } from "@litespace/types";
import CheckEmail from "@/components/Auth/CheckEmail";
import { Button } from "@litespace/ui/Button";
import { EmailVerificationError } from "@/components/Auth/EmailVerificationError";

export type VerificationState = "loading" | "success" | "error" | "resend";

const EmailVerification: React.FC<{
  state: VerificationState;
  retry: Void;
  resend: Void;
  goDashboard: Void;
}> = ({ state = "loading", retry, resend, goDashboard }) => {
  const intl = useFormatMessage();
  return (
    <div className="tw-grow tw-flex tw-flex-col tw-w-full tw-items-center tw-justify-center tw-gap-10">
      {state !== "resend" ? (
        <Typography
          element="h4"
          weight={"semibold"}
          className="text-natural-950"
        >
          {intl("page.verify.email.title")}
        </Typography>
      ) : null}
      {state === "loading" ? (
        <Loader size="large" text={intl("page.verify.email.loading")} />
      ) : null}
      {state === "error" ? (
        <EmailVerificationError resend={resend} retry={retry} />
      ) : null}
      {state === "success" ? (
        <div className="tw-flex tw-flex-col tw-gap-6 tw-text-center tw-w-full">
          <Typography className="tw-text-natural-700" element="body">
            {intl("page.verify.email.success")}
          </Typography>
          <Button className="tw-w-full" size="large" onClick={goDashboard}>
            {intl("global.go-dashboard")}
          </Button>
        </div>
      ) : null}
      {state === "resend" ? <CheckEmail resend={resend} /> : null}
    </div>
  );
};

export { EmailVerification };
