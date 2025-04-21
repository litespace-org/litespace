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

function makeTransporter(user: string, pass: string): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
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

  constructor(email: string, password: string) {
    this.email = email;
    this.transporter = makeTransporter(email, password);
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
