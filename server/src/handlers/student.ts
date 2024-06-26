import { users } from "@/models";
import { IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import asyncHandler from "express-async-handler";
import { generateAuthorizationToken } from "@/lib/auth";
import { emailer } from "@/lib/email";
import { EmailTemplate } from "@litespace/emails";

export async function create(req: Request.Default, res: Response) {
  const { email, password, name } = schema.http.student.create.parse(req.body);

  await users.create({
    password: hashPassword(password),
    type: IUser.Type.Student,
    email,
    name,
  });

  await emailer.send({
    to: email,
    template: EmailTemplate.VerifyEmail,
    props: { url: "http://example.com" },
  });

  res.status(200).send();
}

export default {
  create: asyncHandler(create),
};
