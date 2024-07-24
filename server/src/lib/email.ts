import { emailConfig } from "@/constants";
import { Emailer, EmailTemplate } from "@litespace/emails";
import { randomBytes, sha256 } from "@/lib/crypto";
import dayjs from "@/lib/dayjs";
import { tokens } from "@/models";
import { IToken } from "@litespace/types";
import { Url } from "./url";

export const emailer = new Emailer(emailConfig.email, emailConfig.password);

export async function sendUserVerificationEmail({
  userId,
  email,
  origin,
}: {
  userId: number;
  email: string;
  origin: string;
}) {
  const token = randomBytes();
  const hash = sha256(token);
  const expiresAt = dayjs.utc().add(10, "minutes").toDate();

  await tokens.create({
    type: IToken.Type.VerifyEmail,
    userId,
    expiresAt,
    hash,
  });

  const url = new Url("/verify-email", origin)
    .withParam("token", token)
    .toString();

  await emailer.send({
    to: email,
    template: EmailTemplate.VerifyEmail,
    props: { url },
  });
}
