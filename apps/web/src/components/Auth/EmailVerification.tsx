import React from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Loader } from "@litespace/ui/Loading";
import { Void } from "@litespace/types";
import CheckEmail from "@/components/Auth/CheckEmail";
import { Button } from "@litespace/ui/Button";
import { EmailVerificationError } from "@/components/Auth/EmailVerificationError";
import { LocalId } from "@litespace/ui/locales";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

export type VerificationState = "verifying" | "success" | "error" | "resend";

const Animate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: "linear",
        },
      }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const EmailVerification: React.FC<{
  state: VerificationState;
  errorMessage: LocalId | null;
  verifying: boolean;
  resending: boolean;
  retry: Void;
  resend: Void;
  goDashboard: Void;
}> = ({
  state = "loading",
  errorMessage,
  verifying,
  retry,
  resend,
  goDashboard,
  resending,
}) => {
  const intl = useFormatMessage();
  const mq = useMediaQuery();

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-items-center tw-justify-center mt-10 sm:mt-[140px] lg:mt-[30vh] gap-6 lg:tw-gap-10">
      {state !== "resend" ? (
        <Typography
          tag="h4"
          className="text-natural-950 font-bold sm:font-semibold text-subtitle-1 sm:text-h4"
        >
          {intl("verify-email.title")}
        </Typography>
      ) : null}

      <AnimatePresence initial={false} mode="wait">
        {state === "verifying" ? (
          <Animate key="loading">
            <Loader
              size={mq.sm ? "large" : "small"}
              text={intl("verify-email.loading")}
            />
          </Animate>
        ) : null}

        {state === "error" &&
        errorMessage !== "error.api.email-already-verified" ? (
          <Animate key="error">
            <EmailVerificationError
              errorMessage={errorMessage}
              resending={resending}
              reverifying={verifying}
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
            <CheckEmail resending={resending} resend={resend} />
          </Animate>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export { EmailVerification };
