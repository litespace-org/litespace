import { emailConfig, environment } from "@/constants";
import { Emailer } from "@litespace/emails";

export const emailer = new Emailer({
  email: emailConfig.email,
  password: emailConfig.password,
  logger: environment !== "production",
  debug: environment !== "production",
});
