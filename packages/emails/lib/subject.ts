import { translate } from "@/components/Common/Translate";
import { EmailTemplate } from "@/emails";

export const EMAIL_SUBJECT: Record<EmailTemplate, string> = {
  [EmailTemplate.VerifyEmail]: translate.string("verify-email.title"),
  [EmailTemplate.ForgetPassword]: translate.string(
    "forget-password-email.title"
  ),
  [EmailTemplate.VerifyEmailV2]: translate.string("verify-email.title"),
  [EmailTemplate.ForgetPasswordV2]: translate.string(
    "forget-password-email.title"
  ),
};
