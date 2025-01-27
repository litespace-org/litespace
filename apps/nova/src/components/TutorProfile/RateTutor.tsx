import Star from "@litespace/assets/Star";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import { RatingDialog } from "@litespace/luna/TutorFeedback";
import { useUserContext } from "@litespace/headless/context/user";
import React, { useCallback, useState } from "react";
import { useCreateRatingTutor } from "@litespace/headless/rating";
import { useToast } from "@litespace/luna/Toast";
import { QueryKey } from "@litespace/headless/constants";
import { useInvalidateQuery } from "@litespace/headless/query";

export const RateTutor: React.FC<{
  tutorName: string;
  tutorId: number;
}> = ({ tutorName, tutorId }) => {
  const { user } = useUserContext();
  const intl = useFormatMessage();
  const [rating, setRating] = useState<boolean>(false);
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const onRateError = useCallback(
    () =>
      toast.error({
        title: intl("tutor.rate.error"),
      }),
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

  const rateTutor = useCallback(
    ({ value, feedback }: { value: number; feedback: string | null }) => {
      rateMutation.mutate({ value, feedback, rateeId: tutorId });
    },
    [tutorId, rateMutation]
  );

  if (!user) return null;
  return (
    <div className="flex gap-10 flex-col items-center justify-center ">
      <Typography
        element="subtitle-1"
        weight="medium"
        className="text-natural-950 text-center max-w-[912px]"
      >
        {intl("tutor.profile.your-ratings-help")}
      </Typography>
      <Button
        onClick={() => setRating(true)}
        size={ButtonSize.Small}
        className="w-[386px] flex items-center gap-2"
      >
        <Typography element="body" weight="semibold">
          {intl("tutor.profile.rate-tutor")}
        </Typography>
        <Star className="[&>*]:fill-natural-50" />
      </Button>
      <RatingDialog
        imageUrl={user.image}
        studentName={user.name || ""}
        onSubmit={rateTutor}
        studentId={user.id}
        loading={rateMutation.isPending}
        feedback={null}
        tutorName={tutorName}
        open={rating}
        onClose={() => setRating(false)}
      />
    </div>
  );
};
