import { users } from "@/models";
import { IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { schema } from "@/validation";
import asyncHandler from "express-async-handler";
import { sendUserVerificationEmail } from "@/lib/email";
import { NextFunction, Request, Response } from "express";
import { badRequest } from "@/lib/error";

export async function create(req: Request, res: Response, next: NextFunction) {
  const { email, password } = schema.http.student.create.parse(req.body);

  const student = await users.create({
    password: hashPassword(password),
    role: IUser.Role.Student,
    email,
    // name,
  });

  const origin = req.get("origin");
  if (!origin) return next(badRequest());

  await sendUserVerificationEmail({
    userId: student.id,
    email: student.email,
    origin,
  });

  res.status(200).send();
}

export default {
  create: asyncHandler(create),
};
