import { EmailVerification } from "@litespace/ui/EmailVerification";
import { Route } from "@/types/routes";
import React, { useCallback } from "react";

const VerifyEmail: React.FC = () => {
  const onVerification = useCallback(() => {
    // todo: refersh user data
  }, []);

  return (
    <EmailVerification onVerification={onVerification} root={Route.Root} />
  );
};

export default VerifyEmail;
