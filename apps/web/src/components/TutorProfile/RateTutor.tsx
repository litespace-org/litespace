import Star from "@litespace/assets/Star";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { RatingDialog } from "@litespace/ui/RatingDialog";
import { useUser } from "@litespace/headless/context/user";
import React, { useCallback, useState } from "react";
import { useCreateRatingTutor } from "@litespace/headless/rating";
import { useToast } from "@litespace/ui/Toast";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useOnError } from "@/hooks/error";

export const RateTutor: React.FC<{
  tutorName: string;
  tutorId: number;
}> = ({ tutorName, tutorId }) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const [rating, setRating] = useState<boolean>(false);
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const onRateError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("tutor.rate.error"),
        description: intl(messageId),
      });
    },
  });

  const onRateSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorRating, tutorId]);
    setRating(false);
  }, [tutorId, invalidateQuery]);

  const rateMutation = useCreateRatingTutor({
    onSuccess: onRateSuccess,
    onError: onRateError,
  });

  if (!user) return null;

  return (
    <div className="flex gap-6 lg:gap-10 flex-col items-center justify-center max-w-[450px] mx-auto">
      <Typography
        tag="span"
        className="text-natural-700 md:text-natural-950 text-center max-w-[631px] text-caption md:text-body lg:text-subtitle-1 font-semibold md:font-bold lg:font-medium"
      >
        {intl("tutor.profile.your-ratings-help")}
      </Typography>
      <Button
        onClick={() => setRating(true)}
        size="large"
        className="w-full md:w-[267px] flex items-center gap-2"
      >
        <Typography
          tag="span"
          className="text-nowrap text-caption md:text-body font-semibold md:font-medium"
        >
          {intl("tutor.profile.rate-tutor")}
        </Typography>
        <Star className="w-4 h-4 [&>*]:stroke-natural-50 [&>*]:fill-transparent" />
      </Button>
      {rating ? (
        <RatingDialog
          title={intl("rating-dialog.rate-tutor.title")}
          header={intl("rating-dialog.rate-tutor.header", { tutor: tutorName })}
          description={intl("rating-dialog.rate-tutor.description")}
          submitting={rateMutation.isPending}
          close={() => setRating(false)}
          maxAllowedCharacters={180}
          submit={({ value, feedback }) => {
            rateMutation.mutate({ value, feedback, rateeId: tutorId });
          }}
        />
      ) : null}
    </div>
  );
};
