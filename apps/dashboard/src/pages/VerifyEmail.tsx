import { useAppDispatch } from "@/redux/store";
import { findCurrentUser } from "@/redux/user/profile";
import { useAtlas } from "@litespace/headless/atlas";
import { Dashboard } from "@litespace/utils/routes";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useVerifyEmail } from "@litespace/headless/auth";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loading } from "@litespace/ui/Loading";
import { Typography } from "@litespace/ui/Typography";

const VerifyEmail: React.FC = () => {
  const dispatch = useAppDispatch();
  const atlas = useAtlas();

  const onVerification = useCallback(() => {
    dispatch(findCurrentUser.call(atlas));
  }, [atlas, dispatch]);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useFormatMessage();
  const toast = useToast();
  const [token, setToken] = useState<string | null>(null);

  const onSuccess = useCallback(() => {
    toast.success({ title: intl("verify-email.success") });
    onVerification();
    navigate(Dashboard.Root);
  }, [toast, intl, onVerification, navigate]);

  const onError = useCallback(() => {
    toast.error({ title: intl("verify-email.failure") });

    setTimeout(() => {
      navigate(Dashboard.Root);
    }, 5_000);
  }, [toast, intl, navigate]);

  useEffect(() => {
    if (token) return;
    const searchParamsToken = searchParams.get("token");
    if (!searchParamsToken) return navigate(Dashboard.Root);
    setToken(searchParamsToken);
    setSearchParams({});
  }, [intl, navigate, searchParams, setSearchParams, token]);

  const mutation = useVerifyEmail({ onSuccess, onError });

  useEffect(() => {
    if (!token || mutation.isPending || mutation.isError) return;
    mutation.mutate(token);
  }, [token, mutation]);

  if (mutation.isPending) return <Loading className="tw-h-screen" />;

  if (mutation.isError)
    return (
      <div className="tw-h-screen tw-flex tw-items-center tw-justify-center">
        <Typography tag="h3" className="text-h3">
          {intl("verify-email.redirect")}
        </Typography>
      </div>
    );

  return null;
};

export default VerifyEmail;
