import { Route } from "@/lib/route";
import { useAppDispatch } from "@/redux/store";
import { findCurrentUser } from "@/redux/user/profile";
import { useAtlas } from "@litespace/headless/atlas";
import { DashboardEmailVerification } from "@litespace/ui/EmailVerification";
import React, { useCallback } from "react";

const VerifyEmail: React.FC = () => {
  const dispatch = useAppDispatch();
  const atlas = useAtlas();

  const onVerification = useCallback(() => {
    dispatch(findCurrentUser.call(atlas));
  }, [atlas, dispatch]);
  return (
    <DashboardEmailVerification
      onVerification={onVerification}
      root={Route.Root}
    />
  );
};

export default VerifyEmail;
