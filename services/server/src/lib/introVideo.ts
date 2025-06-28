import { tutors } from "@litespace/models";
import { IIntroVideo, IUser } from "@litespace/types";
import { isAdmin, isTutorManager } from "@litespace/utils";

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

export function canUpdate({
  user,
  video,
  payload,
}: {
  user: IUser.Self;
  video: IIntroVideo.Self;
  payload: IIntroVideo.UpdateApiPayload;
}): boolean {
  if (!isTutorManager(user) && !isAdmin(user)) return false;
  if (!isAdmin(user) && payload.reviewerId) return false;
  // if the user trying to update isn't the assigned reviewer or the admin
  if (isTutorManager(user) && user.id !== video.reviewerId) return false;
  return true;
}

export async function canReview(reviewerId?: number): Promise<boolean> {
  if (!reviewerId) return false;
  const tutorManager = await tutors.findById(reviewerId);
  if (!tutorManager || !tutorManager.activated) return false;
  return true;
}
