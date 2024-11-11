import { EmailVerification } from "@litespace/luna/EmailVerification";
import { Route } from "@/types/routes";

const VerifyEmail = () => {
  return <EmailVerification route={Route.Root} />;
};

export default VerifyEmail;
