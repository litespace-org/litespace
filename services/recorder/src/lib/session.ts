import { IInterview, ILesson } from "@litespace/types";
import { interviews, lessons } from "@litespace/models";

export type Session =
  | ({ type: "lesson" } & ILesson.Self)
  | ({ type: "interview" } & IInterview.Self);

export async function getSessions({
  after,
  before,
}: {
  after: string;
  before: string;
}): Promise<Session[]> {
  const [lessonsResult, interviewsResult] = await Promise.all([
    lessons.find({
      after,
      before,
      full: true,
      strict: true,
      canceled: false,
    }),
    interviews.find({
      after,
      before,
      full: true,
      strict: true,
      canceled: false,
    }),
  ]);

  const sessions = lessonsResult.list
    .map(
      (lesson): Session => ({
        type: "lesson",
        ...lesson,
      })
    )
    .concat(
      interviewsResult.list.map(
        (interview): Session => ({
          type: "interview",
          ...interview,
        })
      )
    );

  return sessions;
}
