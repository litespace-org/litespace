import { Route } from "@/types/routes";
import { useToast } from "@litespace/luna/Toast";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useVerifyEmail } from "@litespace/headless/auth";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("page.verify.email.success") });
    navigate(Route.Root);
  }, [toast, intl, navigate]);

  const onError = useCallback(() => {
    toast.success({ title: intl("page.verify.email.failure") });
    navigate(Route.Root);
  }, [toast, intl, navigate]);

  useEffect(() => {
    if (token) return;
    const searchParamsToken = searchParams.get("token");
    if (!searchParamsToken) return navigate(Route.Root);
    setToken(searchParamsToken);
    setSearchParams({});
  }, [intl, navigate, searchParams, setSearchParams, token]);

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

export default VerifyEmail;
