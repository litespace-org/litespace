import nodemailer from "nodemailer";

function makeTransporter(user: string, pass: string): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export class Transporter {
  private readonly transporter: nodemailer.Transporter;

  constructor(email: string, password: string) {
    this.transporter = makeTransporter(email, password);
  }
}
