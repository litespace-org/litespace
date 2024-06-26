import { emailConfig } from "@/constants";
import { Emailer } from "@litespace/emails";

export const emailer = new Emailer(emailConfig.email, emailConfig.password);
