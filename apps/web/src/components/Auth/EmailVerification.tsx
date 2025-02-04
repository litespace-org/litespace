import React from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Loader } from "@litespace/ui/Loading";
import { Void } from "@litespace/types";
import CheckEmail from "@/components/Auth/CheckEmail";
import { Button } from "@litespace/ui/Button";
import { EmailVerificationError } from "@/components/Auth/EmailVerificationError";
import { LocalId } from "@litespace/ui/locales";
import { AnimatePresence } from "framer-motion";
import { Animate } from "@/components/Common/Animate";

export type VerificationState = "loading" | "success" | "error" | "resend";

const EmailVerification: React.FC<{
  state: VerificationState;
  errorMessage: LocalId | null;
  loading: boolean;
  retry: Void;
  resend: Void;
  goDashboard: Void;
}> = ({
  state = "loading",
  errorMessage,
  loading,
  retry,
  resend,
  goDashboard,
}) => {
  const intl = useFormatMessage();

  return (
    <AnimatePresence>
      <div className="tw-grow tw-flex tw-flex-col tw-w-full tw-items-center tw-justify-center tw-gap-10">
        {state !== "resend" ? (
          <Typography
            tag="h4"
            className="text-natural-950 font-semibold text-h4"
          >
            {intl("verify-email.title")}
          </Typography>
        ) : null}

        {state === "loading" ? (
          <Animate key="loading">
            <Loader size="large" text={intl("verify-email.loading")} />
          </Animate>
        ) : null}

        {state === "error" &&
        errorMessage !== "error.api.email-already-verified" ? (
          <Animate key="error">
            <EmailVerificationError
              errorMessage={errorMessage}
              loading={loading}
              resend={resend}
              retry={retry}
            />
          </Animate>
        ) : null}

        {state === "success" ||
        errorMessage === "error.api.email-already-verified" ? (
          <Animate key="success">
            <div className="tw-flex tw-flex-col tw-gap-6 tw-text-center tw-w-full">
              <Typography tag="span" className="tw-text-natural-700 text-body">
                {intl("verify-email.success")}
              </Typography>
              <Button className="tw-w-full" size="large" onClick={goDashboard}>
                {intl("labels.go-dashboard")}
              </Button>
            </div>
          </Animate>
        ) : null}

        {state === "resend" ? (
          <Animate key="resend">
            <CheckEmail resend={resend} />
          </Animate>
        ) : null}
      </div>
    </AnimatePresence>
  );
};

export { EmailVerification };
