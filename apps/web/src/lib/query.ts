import { isNaN } from "lodash";
import { capture } from "@/lib/sentry";

const rateLessonQueryKeys = {
  lessonId: "rate-lesson-id",
  start: "rate-lesson-start",
  tutorId: "rate-tutor-id",
  tutorName: "rate-tutor-name",
} as const;

export function asRateLessonQuery({
  start,
  lessonId,
  tutorId,
  tutorName,
}: {
  start: string;
  lessonId: number;
  tutorId: number;
  tutorName: string | null;
}) {
  const keys = rateLessonQueryKeys;
  const params: Record<string, string> = {
    [keys.lessonId]: lessonId.toString(),
    [keys.tutorId]: tutorId.toString(),
    [keys.start]: start,
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

  if (isNaN(tutorId) || isNaN(lessonId)) {
    capture(new Error("Invalid rate lesson URL params."));
    return null;
  }

  return { lessonId, start, tutorId, tutorName };
}
