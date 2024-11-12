import { EmailVerification } from "@litespace/luna/EmailVerification";
import { Route } from "@/types/routes";
import React, { useCallback } from "react";
import { useAppDispatch } from "@/redux/store";
import { useAtlas } from "@litespace/headless/atlas";
import { findCurrentUser } from "@/redux/user/profile";

const VerifyEmail: React.FC = () => {
  const dispatch = useAppDispatch();
  const atlas = useAtlas();

  const onVerification = useCallback(() => {
    dispatch(findCurrentUser.call(atlas));
  }, [atlas, dispatch]);

  return (
    <EmailVerification onVerification={onVerification} root={Route.Root} />
  );
};

export default VerifyEmail;
