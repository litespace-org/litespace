import { IRating } from "@litespace/types";
import { concat } from "lodash";

const MAX_RATING_COUNT = 8;

export const organizeRatings = (
  ratings?: IRating.FindTutorRatingsApiResponse["list"],
  currentUserId?: number
) => {
  if (!ratings) return { ratings: [], currentUserRated: false };

  let currentUserRating: IRating.RateeRating | undefined;
  const ratingsWithFeedback: IRating.RateeRating[] = [];
  const ratingsWithoutFeedback: {
    ratings: IRating.RateeRating[];
    value: number;
  }[] = [];

  ratings.forEach((rating) => {
    if (rating.userId === currentUserId) return (currentUserRating = rating);

    if (rating.feedback) ratingsWithFeedback.push(rating);
    if (!rating.feedback) {
      const ratingGroup = ratingsWithoutFeedback.find(
        (rating) => rating.value === rating.value
      );
      if (ratingGroup) return ratingGroup.ratings.push(rating);

      return ratingsWithoutFeedback.push({
        ratings: [rating],
        value: rating.value,
      });
    }
  });

  const otherUsersRatings = [...ratingsWithFeedback, ...ratingsWithoutFeedback];
  return {
    ratings: concat(currentUserRating || [], otherUsersRatings).slice(
      0,
      MAX_RATING_COUNT
    ),
    currentUserRated: !!currentUserRating,
  };
};
