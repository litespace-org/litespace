import { IRating } from "@litespace/types";

export const ratingOrganizer = (
  ratings: IRating.FindTutorRatingsApiResponse["list"],
  currentUserId: number
) => {
  let currentUserRating: IRating.RateeRatings | undefined;
  const ratingsWithFeedback: IRating.RateeRatings[] = [];
  const ratingsWithoutFeedback: {
    ratings: Array<{
      name: string | null;

      userId: number;

      imageUrl: string | null;
    }>;
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
      if (ratingGroup)
        return ratingGroup.ratings.push({
          name: rating.name,
          imageUrl: rating.image,
          userId: rating.userId,
        });

      return ratingsWithoutFeedback.push({
        ratings: [
          {
            name: rating.name,
            imageUrl: rating.image,
            userId: rating.userId,
          },
        ],
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
