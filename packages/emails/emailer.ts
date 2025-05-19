import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import {
  EmailTemplate,
  ForgetPassword,
  ForgetPasswordV2,
  VerifyEmail,
  VerifyEmailV2,
} from "@/emails";
import { EMAIL_SUBJECT } from "@/lib/subject";

function asUser(email: string) {
  const [user] = email.split("@");
  return user;
}

function makeTransporter({
  user,
  pass,
  logger,
  debug,
}: {
  user: string;
  pass: string;
  logger: boolean;
  debug: boolean;
}): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: "mail.litespace.org",
    port: 465,
    secure: true,
    auth: { user, pass },
    logger,
    debug,
  });
}

type SendEmail =
  | {
      template: EmailTemplate.ForgetPassword | EmailTemplate.VerifyEmail;
      props: { redirectUrl: string };
    }
  | {
      template: EmailTemplate.ForgetPasswordV2 | EmailTemplate.VerifyEmailV2;
      props: { code: number };
    };

export class Emailer {
  public readonly email: string;
  private readonly transporter: nodemailer.Transporter;

  constructor({
    email,
    password,
    logger,
    debug,
  }: {
    email: string;
    password: string;
    logger: boolean;
    debug: boolean;
  }) {
    this.email = email;
    this.transporter = makeTransporter({
      user: asUser(email),
      pass: password,
      logger,
      debug,
    });
  }

  async send({ to, ...email }: { to: string } & SendEmail) {
    await this.transporter.sendMail({
      from: `"LiteSpace" <${this.email}>`,
      to,
      subject: EMAIL_SUBJECT[email.template],
      html: render(this.template(email)),
    });
  }

  private template({ template, props }: SendEmail) {
    if (template === EmailTemplate.ForgetPassword) return ForgetPassword(props);
    if (template === EmailTemplate.ForgetPasswordV2)
      return ForgetPasswordV2(props);
    if (template === EmailTemplate.VerifyEmail) return VerifyEmail(props);
    if (template === EmailTemplate.VerifyEmailV2) return VerifyEmailV2(props);
    throw new Error(`Unsupported email template: ${template}`);
  }
}
