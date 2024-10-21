import { Route } from "@/types/routes";
import { toaster, useFormatMessage, useVerifyEmail } from "@litespace/luna";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const [token, setToken] = useState<string | null>(null);

  const onSuccess = useCallback(() => {
    toaster.success({ title: intl("page.verify.email.success") });
    navigate(Route.Root);
  }, []);

  const onError = useCallback(() => {
    toaster.success({ title: intl("page.verify.email.failure") });
    navigate(Route.Root);
  }, []);

  useEffect(() => {
    if (token) return;
    const searchParamsToken = searchParams.get("token");
    if (!searchParamsToken) return navigate(Route.Root);
    setToken(searchParamsToken);
    setSearchParams({});
  }, []);

  const mutation = useVerifyEmail({ onSuccess, onError });
  useEffect(() => {
    if (!token || mutation.isPending) return;
    mutation.mutate(token);
  }, [token]);

  return (
    <div className="text-4xl text-center">
      Verifying your Email, Wait for a second ...
    </div>
  );
};

export default VerifyEmail;
