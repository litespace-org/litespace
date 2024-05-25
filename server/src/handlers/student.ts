import { User, users } from "@/models";
import { hashPassword } from "@/lib/user";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import asyncHandler from "express-async-handler";

export async function create(req: Request.Default, res: Response) {
  const { email, password, name, avatar } = schema.http.student.create.parse(
    req.body
  );

  const id = await users.create({
    type: User.Type.Student,
    email,
    password: hashPassword(password),
    avatar,
    name,
  });

  res.status(200).json({ id });
}

export default {
  create: asyncHandler(create),
};
