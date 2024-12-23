import { IRating } from "@litespace/types";

export const organizeRatings = (
  ratings: IRating.FindTutorRatingsApiResponse["list"] | undefined,
  currentUserId: number | undefined
) => {
  if (!ratings) return [];

  let currentUserRating: IRating.RateeRating | undefined;
  const ratingsWithFeedback: IRating.RateeRating[] = [];
  const ratingsWithoutFeedback: {
    ratings: IRating.RateeRating[];
    value: number;
  }[] = [];

  ratings.forEach((rating) => {
    if (rating.userId === currentUserId) {
      currentUserRating = rating;
      return;
    }
    if (rating.feedback) ratingsWithFeedback.push(rating);
    if (!rating.feedback) {
      const ratingGroup = ratingsWithoutFeedback.find(
        (r) => r.value === rating.value
      );
      if (ratingGroup) return ratingGroup.ratings.push(rating);

      return ratingsWithoutFeedback.push({
        ratings: [rating],
        value: rating.value,
      });
    }
  });

  if (currentUserRating)
    return [
      currentUserRating,
      ...ratingsWithFeedback,
      ...ratingsWithoutFeedback,
    ].slice(0, 8);
  return [...ratingsWithFeedback, ...ratingsWithoutFeedback].slice(0, 8);
};
