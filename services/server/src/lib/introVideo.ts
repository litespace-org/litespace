import { tutors } from "@litespace/models";
import { IUser } from "@litespace/types";

export async function chooseReviewer(
  execlude?: number
): Promise<number | null> {
  // get two tutor-managers ids from the database with the lowest
  // number of reviews (introVideos been reviewed)
  const reviewerIds = await tutors.findTutorsByIntroVideos({
    count: 2,
    order: "asc",
    role: IUser.Role.TutorManager,
    activated: true,
  });

  // select which tutor-manager to be assigned as reviewer
  for (const id of reviewerIds) {
    if (id !== execlude) return id;
  }

  return null;
}
