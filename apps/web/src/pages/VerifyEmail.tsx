import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import {
  EmailVerification,
  VerificationState,
} from "@/components/Auth/EmailVerification";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";
import { Web } from "@litespace/utils/routes";
import { capture } from "@/lib/sentry";
import { LocalId } from "@litespace/ui/locales";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useOnError } from "@/hooks/error";
import {
  useConfirmVerificationEmailCode,
  useSendVerificationEmailCode,
} from "@litespace/headless/confirmationCode";

const VerifyEmail: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [verificationState, setVerificationState] =
    useState<VerificationState>("verifying");
  const [errorMessage, setErrorMessage] = useState<LocalId | null>(null);
  const [code, setCode] = useState<number | null>(null);
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();
  const mq = useMediaQuery();

  const onVerifySuccess = useCallback(() => {
    setVerificationState("success");
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const goDashboard = useCallback(() => {
    navigate(Web.Root);
  }, [navigate]);

  const onVerifyError = useCallback((error: unknown) => {
    capture(error);
    const errorMessage = getErrorMessageId(error);
    setErrorMessage(errorMessage);
    setVerificationState("error");
  }, []);

  const verifyMutation = useConfirmVerificationEmailCode({
    onSuccess: onVerifySuccess,
    onError: onVerifyError,
  });

  const onResendSuccess = useCallback(() => {
    setVerificationState("resend");
    toast.success({
      title: intl("verify-email.check-resend.success.title"),
      description: intl("verify-email.check-resend.success.desc"),
    });
  }, [toast, intl]);

  const onResendError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("verify-email.check-resend.error"),
        description: intl(messageId),
      });
    },
  });

  const resendMutation = useSendVerificationEmailCode({
    onSuccess: onResendSuccess,
    onError: onResendError,
  });

  const resendEmail = useCallback(() => {
    resendMutation.mutate();
  }, [resendMutation]);

  useEffect(() => {
    if (code) return;
    const searchParamsCode = searchParams.get("code");
    if (!searchParamsCode) return navigate(Web.Root);
    setCode(Number(searchParamsCode));
    setSearchParams({});
  }, [navigate, searchParams, setSearchParams, code]);

  const verifyEmail = useCallback(() => {
    setVerificationState("verifying");
    verifyMutation.mutate(code || 0);
  }, [verifyMutation, code]);

  useEffect(() => {
    if (!code || verifyMutation.isPending || verifyMutation.isError) return;
    verifyEmail();
  }, [code, verifyEmail, verifyMutation]);

  return (
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <EmailVerification
          state={verificationState}
          errorMessage={errorMessage}
          verifying={verifyMutation.isPending}
          resending={resendMutation.isPending}
          resend={resendEmail}
          retry={verifyEmail}
          goDashboard={goDashboard}
        />
      </main>
      {mq.lg ? <Aside /> : null}
    </div>
  );
};

export default VerifyEmail;
