import { Route } from "@/types/routes";
import { toaster, useFormatMessage, useVerifyEmail } from "@litespace/luna";
import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const navigate = useNavigate();
  const intl = useFormatMessage();

  const token = searchParams[0].get("token");

  const onSuccess = useCallback(() => {
    toaster.success({ title: intl("page.verify.email.success") });
    navigate(Route.Root);
  }, []);

  const onError = useCallback(() => {
    toaster.success({ title: intl("page.verify.email.failure") });
    navigate(Route.Register);
  }, []);

  useEffect(() => {
    if (!token) return navigate(Route.Login);

    const mutation = useVerifyEmail({ onSuccess, onError });
    mutation.mutate(token);
  }, []);

  return (
    <div className="text-4xl text-center">
      Verifying your Email, Wait for a second ...
    </div>
  );
};

export default VerifyEmail;
