import Aside from "@/components/Auth/Aside";
import Header from "@/components/Auth/Header";
import {
  EmailVerification,
  VerificationState,
} from "@litespace/ui/EmailVerification";
import React, { useCallback, useEffect, useState } from "react";
import { useSendVerifyEmail, useVerifyEmail } from "@litespace/headless/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";
import { CALLBACK_URL, Route } from "@/types/routes";

const VerifyEmail: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [verificationState, setVerificationState] =
    useState<VerificationState>("loading");
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
    navigate(Route.Root);
  }, [navigate]);

  const onVerifyError = useCallback(() => {
    toast.error({ title: intl("page.verify.email.failure") });
    setVerificationState("error");
  }, [toast, intl]);

  const verifyMutation = useVerifyEmail({
    onSuccess: onVerifySuccess,
    onError: onVerifyError,
  });

  const onResendSuccess = useCallback(() => {
    toast.success({
      title: intl("page.check.email.resend.success"),
    });
  }, [toast, intl]);

  const onResendError = useCallback(() => {
    toast.error({
      title: intl("page.check.email.resend.error"),
    });
  }, [toast, intl]);

  const resendMutation = useSendVerifyEmail({
    onSuccess: onResendSuccess,
    onError: onResendError,
  });

  const reSendEmail = useCallback(
    () => resendMutation.mutate(CALLBACK_URL),
    [resendMutation]
  );

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
          resend={reSendEmail}
          retry={verifyEmail}
          goDashboard={goDashboard}
        />
      </main>
      <Aside />
    </div>
  );
};

export default VerifyEmail;
