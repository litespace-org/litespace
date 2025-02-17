import Star from "@litespace/assets/Star";
import { Button } from "@litespace/ui/Button";
import { useWebFormatMessage } from "@/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { RatingDialog } from "@litespace/ui/RatingDialog";
import { useUserContext } from "@litespace/headless/context/user";
import React, { useCallback, useState } from "react";
import { useCreateRatingTutor } from "@litespace/headless/rating";
import { useToast } from "@litespace/ui/Toast";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { capture } from "@/lib/sentry";

export const RateTutor: React.FC<{
  tutorName: string;
  tutorId: number;
}> = ({ tutorName, tutorId }) => {
  const { user } = useUserContext();
  const intl = useWebFormatMessage();
  const [rating, setRating] = useState<boolean>(false);
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();
  const mq = useMediaQuery();

  const onRateError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("tutor.rate.error"),
        description: intl(errorMessage),
      });
    },
    [intl, toast]
  );

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
    <div className="flex gap-6 md:gap-10 flex-col items-center justify-center">
      <Typography
        tag="span"
        className="text-natural-700 md:text-natural-950 text-center max-w-[912px] text-caption md:text-subtitle-1 font-semibold md:font-medium"
      >
        {intl("tutor.profile.your-ratings-help")}
      </Typography>
      <Button
        onClick={() => setRating(true)}
        size={mq.md ? "medium" : "small"}
        className="w-full md:w-[386px] flex items-center gap-2"
      >
        <Typography
          tag="span"
          className="text-nowrap text-caption md:text-body font-semibold"
        >
          {intl("tutor.profile.rate-tutor")}
        </Typography>
        <div className="w-6 h-6">
          <Star className="[&>*]:fill-natural-50" />
        </div>
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
