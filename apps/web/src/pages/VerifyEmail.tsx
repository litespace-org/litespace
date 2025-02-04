import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import {
  EmailVerification,
  VerificationState,
} from "@/components/Auth/EmailVerification";
import React, { useCallback, useEffect, useState } from "react";
import { useSendVerifyEmail, useVerifyEmail } from "@litespace/headless/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";
import { VERIFY_EMAIL_CALLBACK_URL } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { capture } from "@/lib/sentry";
import { LocalId } from "@litespace/ui/locales";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

const VerifyEmail: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [verificationState, setVerificationState] =
    useState<VerificationState>("loading");
  const [errorMessage, setErrorMessage] = useState<LocalId | null>(null);
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);
  const invalidateQuery = useInvalidateQuery();

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

  const verifyMutation = useVerifyEmail({
    onSuccess: onVerifySuccess,
    onError: onVerifyError,
  });

  const onResendSuccess = useCallback(() => {
    toast.success({
      title: intl("verify-email.check-resend.success"),
    });
  }, [toast, intl]);

  const onResendError = useCallback(() => {
    toast.error({
      title: intl("verify-email.check-resend.error"),
    });
  }, [toast, intl]);

  const resendMutation = useSendVerifyEmail({
    onSuccess: onResendSuccess,
    onError: onResendError,
  });

  const resendEmail = useCallback(() => {
    resendMutation.mutate(VERIFY_EMAIL_CALLBACK_URL);
    setVerificationState("resend");
  }, [resendMutation]);

  useEffect(() => {
    if (token) return;
    const searchParamsToken = searchParams.get("token");
    setToken(searchParamsToken);
    setSearchParams({});
  }, [intl, navigate, searchParams, setSearchParams, token]);

  const verifyEmail = useCallback(() => {
    if (!token) return;
    setVerificationState("loading");
    verifyMutation.mutate(token);
  }, [verifyMutation, token]);

  useEffect(() => {
    if (!token || verifyMutation.isPending || verifyMutation.isError) return;
    verifyEmail();
    setToken(null);
  }, [token, verifyEmail, verifyMutation]);

  return (
    <div className="flex flex-row gap-8 h-full p-6">
      <main className="flex flex-col items-center flex-1 flex-shrink-0 w-full">
        <Header />
        <EmailVerification
          state={verificationState}
          errorMessage={errorMessage}
          loading={resendMutation.isPending || verifyMutation.isPending}
          resend={resendEmail}
          retry={verifyEmail}
          goDashboard={goDashboard}
        />
      </main>
      <Aside />
    </div>
  );
};

export default VerifyEmail;
