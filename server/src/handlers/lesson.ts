import { User, complex, lessons, tutors } from "@/database";
import { createZoomMeeting } from "@/integrations/zoom";
import { isAdmin } from "@/lib/common";
import ResponseError, { NotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request.Default, res: Response, next: NextFunction) {
  const { tutorId, slotId, start, duration } =
    schema.http.lessons.create.body.parse(req.body);
  // validation
  // - validate empty slot
  // - validate start and duration
  // - validate user subscription
  // - update user remaining minutes
  // - no lessons at this time.

  const tutor = await complex.getTutorById(tutorId);
  if (!tutor) return next(new NotFound());

  if (req.user.type !== User.Type.Student)
    return next(new ResponseError("Only students can register lessons", 401));

  const meetting = await createZoomMeeting({
    tutorId,
    tutorEmail: tutor.email,
    start,
    duration,
  });

  const now = new Date().toISOString();
  const id = await lessons.create({
    tutorId: tutor.id,
    studentId: req.user.id,
    slotId,
    start,
    duration,
    meetingUrl: meetting.joinUrl,
    zoomMeetingId: meetting.id,
    createdAt: now,
    updatedAt: now,
  });

  res.status(200).json({ id });
}

async function delete_() {}

async function getLessons(user: User.Self) {
  const id = user.id;
  const type = user.type;
  const studnet = type === User.Type.Student;
  const tutor = type === User.Type.Tutor;

  if (studnet) return await lessons.findByStudentId(id);
  if (tutor) return await lessons.findByTutuorId(id);
  return await lessons.findAll();
}

async function getMany(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const lessons = await getLessons(req.user);
  res.status(200).json(lessons);
}

export default {
  create: asyncHandler(create),
  delete: asyncHandler(delete_),
  list: asyncHandler(getMany),
};
