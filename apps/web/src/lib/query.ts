import { isNaN } from "lodash";
import { capture } from "@/lib/sentry";

const rateLessonQueryKeys = {
  lessonId: "rate-lesson-id",
  start: "rate-lesson-start",
  tutorId: "rate-tutor-id",
  tutorName: "rate-tutor-name",
  duration: "rate-lesson-duration",
} as const;

export function asRateLessonQuery({
  start,
  lessonId,
  tutorId,
  tutorName,
  duration,
}: {
  start: string;
  lessonId: number;
  tutorId: number;
  tutorName: string | null;
  duration: number;
}) {
  const keys = rateLessonQueryKeys;
  const params: Record<string, string> = {
    [keys.lessonId]: lessonId.toString(),
    [keys.tutorId]: tutorId.toString(),
    [keys.start]: start,
    [keys.duration]: duration.toString(),
  };
  if (tutorName) params[keys.tutorName] = tutorName;
  return new URLSearchParams(params).toString();
}

export function getRateLessonQuery(params: URLSearchParams) {
  const keys = rateLessonQueryKeys;

  const tutorId = Number(params.get(keys.tutorId));
  const lessonId = Number(params.get(keys.lessonId));
  const start = params.get(keys.start) || null;
  const tutorName = params.get(keys.tutorName) || null;
  const duration = Number(params.get(keys.duration));

  if (isNaN(tutorId) || isNaN(lessonId) || isNaN(duration)) {
    capture(new Error("Invalid rate lesson URL params."));
    return null;
  }

  return { lessonId, start, tutorId, tutorName, duration };
}
