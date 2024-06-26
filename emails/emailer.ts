import nodemailer from "nodemailer";
import { EmailTemplate } from "./emails";
import { render } from "@react-email/components";
import MyEmail from "./emails/MyEmail";
import ForgetPassword from "./emails/ForgetPassword";

function makeTransporter(user: string, pass: string): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

type SendEmail = {
  template: EmailTemplate.ForgetPassword;
  props: { url: string };
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
      from: this.email,
      to,
      subject: "TEST",
      html: this.html(email),
    });
  }

  private html(email: SendEmail) {
    return render(ForgetPassword(email.props));
  }
}
