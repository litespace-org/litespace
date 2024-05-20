import { complex, lessons, tutors } from "@/database";
import { createZoomMeeting } from "@/integrations/zoom";
import { NotFound } from "@/lib/error";
import { Request, Response } from "@/types/http";
import { schema } from "@/validation";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

async function create(req: Request.Default, res: Response, next: NextFunction) {
  const { tutorId, studentId, slotId, start, duration } =
    schema.http.lessons.create.body.parse(req.body);
  // validation
  // - validate empty slot
  // - validate start and duration
  // - validate user subscription
  // - update user remaining minutes

  const tutor = await complex.getTutorById(tutorId);
  if (!tutor) return next(new NotFound());

  const meetting = await createZoomMeeting({
    tutorId,
    tutorEmail: tutor.email,
    start,
    duration,
  });

  const now = new Date().toISOString();

  await lessons.create({
    tutorId: tutor.id,
    studentId,
    slotId,
    start,
    duration,
    meetingUrl: meetting.joinUrl,
    zoomMeetingId: meetting.id,
    createdAt: now,
    updatedAt: now,
  });

  res.status(200).send();
}

async function delete_() {}

async function get() {}

export default {
  create: asyncHandler(create),
  delete: asyncHandler(delete_),
  get: asyncHandler(get),
};
