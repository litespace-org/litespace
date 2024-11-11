import { Route } from "@/lib/route";
import { EmailVerification } from "@litespace/luna/EmailVerification";

const VerifyEmail = () => {
  return <EmailVerification route={Route.Root} />;
};

export default VerifyEmail;
