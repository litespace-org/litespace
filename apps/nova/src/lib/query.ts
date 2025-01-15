const rateLessonQueryKeys = {
  lessonId: "rate-lesson-id",
  tutorId: "rate-tutor-id",
  tutorName: "rate-tutor-name",
} as const;

export function asRateLessonQuery({
  lessonId,
  tutorId,
  tutorName,
}: {
  lessonId: number;
  tutorId: number;
  tutorName: string | null;
}) {
  const keys = rateLessonQueryKeys;
  const params: Record<string, string> = {
    [keys.lessonId]: lessonId.toString(),
    [keys.tutorId]: tutorId.toString(),
  };
  if (tutorName) params[keys.tutorName] = tutorName;
  return new URLSearchParams(params).toString();
}

export function getRateLessonQuery(params: URLSearchParams) {
  const keys = rateLessonQueryKeys;
  // TODO: validate NAN @mmoehabb
  const tutorId = Number(params.get(keys.tutorId)) || null;
  const lessonId = Number(params.get(keys.lessonId)) || null;
  const tutorName = params.get(keys.tutorName) || null;
  return { lessonId, tutorId, tutorName };
}
