import { EmailVerification } from "@litespace/ui/EmailVerification";
import { Web } from "@litespace/utils/routes";
import React, { useCallback } from "react";

const VerifyEmail: React.FC = () => {
  const onVerification = useCallback(() => {
    // todo: refersh user data
  }, []);

  return <EmailVerification onVerification={onVerification} root={Web.Root} />;
};

export default VerifyEmail;
