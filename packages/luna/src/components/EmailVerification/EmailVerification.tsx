import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useVerifyEmail } from "@litespace/headless/auth";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const EmailVerification: React.FC<{ route: string }> = ({ route }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("page.verify.email.success") });
    navigate(route);
  }, [toast, intl, navigate, route]);

  const onError = useCallback(() => {
    toast.success({ title: intl("page.verify.email.failure") });
    navigate(route);
  }, [toast, intl, navigate, route]);

  useEffect(() => {
    if (token) return;
    const searchParamsToken = searchParams.get("token");
    if (!searchParamsToken) return navigate(route);
    setToken(searchParamsToken);
    setSearchParams({});
  }, [intl, navigate, searchParams, setSearchParams, token, route]);

  const mutation = useVerifyEmail({ onSuccess, onError });

  useEffect(() => {
    if (!token || mutation.isPending) return;
    mutation.mutate(token);
  }, [token, mutation]);

  return (
    <div className="text-4xl text-center">
      Verifying your Email, Wait for a second ...
    </div>
  );
};

export { EmailVerification };
