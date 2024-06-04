import { users } from "@/models";
import { IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import asyncHandler from "express-async-handler";
import { generateAuthorizationToken } from "@/lib/auth";

export async function create(req: Request.Default, res: Response) {
  const { email, password, name } = schema.http.student.create.parse(req.body);

  const user = await users.create({
    password: hashPassword(password),
    type: IUser.Type.Student,
    email,
    name,
  });

  res.status(200).json({ token: generateAuthorizationToken(user.id) });
}

export default {
  create: asyncHandler(create),
};
