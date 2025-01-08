const lessonIdKey = "rate-lesson-id";
const tutorIdKey = "rate-tutor-id";

export function asRateLessonQuery({
  lessonId,
  tutorId,
}: {
  lessonId: number;
  tutorId: number;
}) {
  return `${lessonIdKey}=${lessonId}&${tutorIdKey}=${tutorId}`;
}

export function getLessonQuery(params: URLSearchParams) {
  const tutorId = Number(params.get(tutorIdKey)) || null;
  const lessonId = Number(params.get(lessonIdKey)) || null;
  return { lessonId, tutorId };
}
