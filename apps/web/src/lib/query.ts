import { isNaN } from "lodash";

const rateLessonQueryKeys = {
  lessonId: "rate-lesson-id",
  lessonStart: "rate-lesson-start",
  tutorId: "rate-tutor-id",
  tutorName: "rate-tutor-name",
} as const;

export function asRateLessonQuery({
  lessonId,
  lessonStart,
  tutorId,
  tutorName,
}: {
  lessonId: number;
  lessonStart: string;
  tutorId: number;
  tutorName: string | null;
}) {
  const keys = rateLessonQueryKeys;
  const params: Record<string, string> = {
    [keys.lessonId]: lessonId.toString(),
    [keys.tutorId]: tutorId.toString(),
    [keys.lessonStart]: lessonStart,
  };
  if (tutorName) params[keys.tutorName] = tutorName;
  return new URLSearchParams(params).toString();
}

export function getRateLessonQuery(params: URLSearchParams) {
  const keys = rateLessonQueryKeys;

  const tutorId = Number(params.get(keys.tutorId));
  const lessonId = Number(params.get(keys.lessonId));
  const lessonStart = params.get(keys.lessonStart) || null;
  const tutorName = params.get(keys.tutorName) || null;

  if (isNaN(tutorId) || isNaN(lessonId)) throw Error("Invalid URL params!");

  return { lessonId, lessonStart, tutorId, tutorName };
}
