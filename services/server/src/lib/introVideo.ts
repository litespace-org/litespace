import { tutors } from "@litespace/models";

export async function chooseReviewer(
  execlude?: number
): Promise<number | null> {
  // get two tutor-managers ids from the database with the lowest
  // number of reviews (introVideos been reviewed)
  const reviewerIds = await tutors.findTutorManagersByIntroVideos({
    size: 2,
    order: "asc",
    activated: true,
  });

  // select which tutor-manager to be assigned as reviewer
  for (const id of reviewerIds) {
    if (id !== execlude) return id;
  }

  return null;
}
