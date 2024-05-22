import { Lesson, User, complex, lessons, slots, tutors } from "@/database";
import { createZoomMeeting } from "@/integrations/zoom";
import { isAdmin } from "@/lib/common";
import ResponseError, { Forbidden, NotFound } from "@/lib/error";
import { hasEnoughTime } from "@/lib/lessons";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request.Default, res: Response, next: NextFunction) {
  const { slotId, start, duration } = schema.http.lessons.create.body.parse(
    req.body
  );
  // validation
  // - validate empty slot
  // - validate start and duration
  // - validate user subscription
  // - update user remaining minutes
  // - no lessons at this time.

  if (req.user.type !== User.Type.Student)
    return next(new ResponseError("Only students can register lessons", 401));

  const slot = await slots.findById(slotId);
  if (!slot) return next(new NotFound("Slot"));

  const tutor = await complex.getTutorById(slot.tutorId);
  if (!tutor) return next(new NotFound("Tutor"));

  const bookedLessons = await lessons.findBySlotId(slotId);

  const enough = hasEnoughTime({
    lesson: { start, duration },
    lessons: bookedLessons,
    slot,
  });

  if (!enough)
    return next(
      new ResponseError("Tutor doesn't have the time for this lesson", 400)
    );

  // const meetting = await createZoomMeeting({
  //   tutorId,
  //   tutorEmail: tutor.email,
  //   start,
  //   duration,
  // });

  const now = new Date().toISOString();
  const id = await lessons.create({
    tutorId: tutor.id,
    studentId: req.user.id,
    slotId,
    start,
    duration,
    // meetingUrl: meetting.joinUrl,
    // zoomMeetingId: meetting.id,
    meetingUrl: "some url",
    zoomMeetingId: Math.ceil(Math.random() * 1e10),
    createdAt: now,
    updatedAt: now,
  });

  res.status(200).json({ id });
}

async function delete_(
  req: Request.Default,
  res: Response,
  next: NextFunction
) {
  const { id } = schema.http.lessons.get.query.parse(req.query);

  const lesson = await lessons.findById(id);
  if (!lesson) return next(new NotFound());

  const userId = req.user.id;
  const owner = userId === lesson.studentId || userId === lesson.tutorId;
  const eligible = owner || isAdmin(req.user.type);
  if (!eligible) return next(new Forbidden());

  // todo: delete zoom meeting

  await lessons.delete(id);
  res.status(200).send();
}

async function getLessons(user: User.Self): Promise<Lesson.Self[]> {
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

async function getOne(req: Request.Default, res: Response, next: NextFunction) {
  const { id } = schema.http.lessons.get.query.parse(req.query);
  const lesson = await lessons.findById(id);
  if (!lesson) return next(new NotFound());
  res.status(200).json(lesson);
}

export default {
  create: asyncHandler(create),
  delete: asyncHandler(delete_),
  get: asyncHandler(getOne),
  list: asyncHandler(getMany),
};
