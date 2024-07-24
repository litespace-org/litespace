import { users } from "@/models";
import { IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import asyncHandler from "express-async-handler";
import { sendUserVerificationEmail } from "@/lib/email";

export async function create(req: Request.Default, res: Response) {
  const { email, password, name } = schema.http.student.create.parse(req.body);

  const student = await users.create({
    password: hashPassword(password),
    type: IUser.Type.Student,
    email,
    name,
  });

  await sendUserVerificationEmail({
    userId: student.id,
    email: student.email,
    baseUrl: req.baseUrl,
  });

  res.status(200).send();
}

export default {
  create: asyncHandler(create),
};
