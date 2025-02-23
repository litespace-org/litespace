import { useAppDispatch } from "@/redux/store";
import { findCurrentUser } from "@/redux/user/profile";
import { useAtlas } from "@litespace/headless/atlas";
import { EmailVerification } from "@litespace/ui/EmailVerification";
import { Dashboard } from "@litespace/utils/routes";
import React, { useCallback } from "react";

const VerifyEmail: React.FC = () => {
  const dispatch = useAppDispatch();
  const atlas = useAtlas();

  const onVerification = useCallback(() => {
    dispatch(findCurrentUser.call(atlas));
  }, [atlas, dispatch]);
  return (
    <EmailVerification onVerification={onVerification} root={Dashboard.Root} />
  );
};

export default VerifyEmail;
