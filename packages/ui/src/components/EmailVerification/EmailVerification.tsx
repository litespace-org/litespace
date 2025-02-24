import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useVerifyEmail } from "@litespace/headless/auth";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loading } from "@/components/Loading";
import { Typography } from "@/components/Typography";
import { Void } from "@litespace/types";

const EmailVerification: React.FC<{ root: string; onVerification: Void }> = ({
  root,
  onVerification,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("page.verify.email.success") });
    onVerification();
    navigate(root);
  }, [toast, intl, onVerification, navigate, root]);

  const onError = useCallback(() => {
    toast.error({ title: intl("page.verify.email.failure") });

    setTimeout(() => {
      navigate(root);
    }, 5_000);
  }, [toast, intl, navigate, root]);

  useEffect(() => {
    if (token) return;
    const searchParamsToken = searchParams.get("token");
    if (!searchParamsToken) return navigate(root);
    setToken(searchParamsToken);
    setSearchParams({});
  }, [intl, navigate, searchParams, setSearchParams, token, root]);

  const mutation = useVerifyEmail({ onSuccess, onError });

  useEffect(() => {
    if (!token || mutation.isPending || mutation.isError) return;
    mutation.mutate(token);
  }, [token, mutation]);

  if (mutation.isPending) return <Loading className="tw-h-screen" />;

  if (mutation.isError)
    return (
      <div className="tw-h-screen tw-flex tw-items-center tw-justify-center">
        <Typography tag="span" className="tw-text-[2.5rem]">
          {intl("page.verify.email.redirect")}
        </Typography>
      </div>
    );

  return null;
};

export { EmailVerification };
