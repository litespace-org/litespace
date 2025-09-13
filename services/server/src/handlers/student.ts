import { NextFunction, Request, Response } from "express";
import zod, { ZodSchema } from "zod";
import safeRequest from "express-async-handler";
import { UpdateApiPayload, Self } from "@litespace/types/dist/esm/student";
import { isAdmin, isStudent } from "@litespace/utils/user";
import { forbidden, notfound } from "@/lib/error";
import { users } from "@litespace/models";
import { id, string, number } from "@/validation/utils";

async function findById(id: number): Promise<Self | null> {
  return {
    id,
    userId: 1,
    jobTitle: null,
    englishLevel: null,
    learningObjective: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function updateStudent(
  id: number,
  payload: UpdateApiPayload
): Promise<Self> {
  return {
    id,
    userId: 1,
    jobTitle: payload.job_title || null,
    englishLevel: payload.english_level || null,
    learningObjective: payload.learning_objective || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const updateStudentSchema: ZodSchema<Partial<UpdateApiPayload>> = zod.object({
  job_title: string.nullable().optional(),
  english_level: number.nullable().optional(),
  learning_objective: string.nullable().optional(),
});

const studentId: ZodSchema<{ id: number }> = zod.object({ id });

function update(req: Request, res: Response, next: NextFunction) {
  return safeRequest(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = studentId.parse(req.params);
        const payload: Partial<UpdateApiPayload> = updateStudentSchema.parse(
          req.body
        );
        const user = req.user;

        const student = await findById(id);
        if (!student) return next(notfound.student());

        const targetUser = await users.findById(student.userId);
        if (!targetUser) return next(notfound.user());

        const allowed =
          isAdmin(user) || (isStudent(user) && user.id === student.userId);
        if (!allowed) return next(forbidden());

        const mergedPayload: UpdateApiPayload = {
          job_title: payload.job_title ?? student.jobTitle,
          english_level: payload.english_level ?? student.englishLevel,
          learning_objective:
            payload.learning_objective ?? student.learningObjective,
        };

        const updatedStudent: Self = await updateStudent(id, mergedPayload);

        const response: Self = updatedStudent;
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    }
  )(req, res, next);
}

function create(_req: Request, res: Response, _next: NextFunction) {
  res.sendStatus(200);
}

export default {
  create,
  update,
};
