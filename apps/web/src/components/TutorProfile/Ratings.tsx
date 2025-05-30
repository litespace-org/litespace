import {
  useDeleteRatingTutor,
  useEditRatingTutor,
  useFindTutorRatings,
} from "@litespace/headless/rating";
import React, { useCallback, useMemo, useState } from "react";
import { organizeRatings } from "@/lib/ratings";
import { useUser } from "@litespace/headless/context/user";
import {
  DeleteRating,
  TutorRatingCard,
  TutorRatingCardGroup,
} from "@litespace/ui/TutorFeedback";
import { RatingDialog } from "@litespace/ui/RatingDialog";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import NewTutor from "@litespace/assets/NewTutor";
import { isEmpty } from "lodash";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import { useToast } from "@litespace/ui/Toast";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { RateTutor } from "@/components/TutorProfile/RateTutor";
import cn from "classnames";
import { IUser } from "@litespace/types";
import { useOnError } from "@/hooks/error";

const NoTutorRatings: React.FC<{ tutorName: string | null }> = ({
  tutorName,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col lg:flex-row flex-wrap md:flex-nowrap relative items-center justify-center w-full gap-8 md:gap-12 lg:gap-[88px]">
      <Typography
        tag="span"
        className="text-natural-950 text-center md:-translate-y-7 max-w-[476px] md:max-w-[584px] text-body md:text-subtitle-2 lg:text-subtitle-1 font-semibold lg:font-bold"
      >
        {intl("tutor.profile.first-rating", { tutor: tutorName })}
      </Typography>
      <div className="w-[151px] h-[147px] md:w-[294px] md:h-[294px]">
        <NewTutor />
      </div>
    </div>
  );
};

const Ratings: React.FC<{ id: number; tutorName: string | null }> = ({
  id,
  tutorName,
}) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

  const [editDialog, setEditDialog] = useState<{
    id: number;
    studentName: string;
    studentId: number;
    imageUrl: string | null;
    feedback: string | null;
    rating: number;
  } | null>(null);

  const closeDelete = useCallback(() => {
    setDeleteDialog(null);
  }, []);

  const onDeleteError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("tutor.rating.delete.error"),
        description: intl(messageId),
      });
    },
  });

  const onDeleteSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorRating, id]);
    closeDelete();
  }, [id, invalidateQuery, closeDelete]);

  const deleteMutation = useDeleteRatingTutor({
    onSuccess: onDeleteSuccess,
    onError: onDeleteError,
  });

  const closeEdit = useCallback(() => {
    setEditDialog(null);
  }, []);

  const onEditSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindTutorRating, id]);
    closeEdit();
  }, [id, invalidateQuery, closeEdit]);

  const onEditError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("tutor.rating.edit.error"),
        description: intl(messageId),
      });
    },
  });
  const editMutation = useEditRatingTutor({
    onSuccess: onEditSuccess,
    onError: onEditError,
  });

  const { query: ratingsQuery } = useFindTutorRatings(id, {
    page: 1,
    size: 30,
  });

  const { ratings, currentUserRated } = useMemo(
    () => organizeRatings(ratingsQuery.data?.list || [], user?.id),
    [ratingsQuery.data, user]
  );

  const editRating = useCallback(
    (payload: { value: number; feedback: string | null }) =>
      editDialog &&
      editMutation.mutate({
        id: editDialog.id,
        payload: {
          value: payload.value,
          feedback: payload.feedback || "",
        },
      }),
    [editDialog, editMutation]
  );

  if (ratingsQuery.isLoading || ratingsQuery.isPending)
    return (
      <div className="h-96 flex justify-center items-center">
        <Loading size="medium" text={intl("tutor.profile.loading")} />
      </div>
    );

  if (ratingsQuery.error)
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingError
          size="medium"
          error={intl("tutor.profile.error")}
          retry={ratingsQuery.refetch}
        />
      </div>
    );

  return (
    <div
      className={cn(
        "flex flex-col justify-center md:px-10 md:pt-6 md:pb-10 lg:pt-8",
        isEmpty(ratings)
          ? "pt-4 gap-8 md:gap-12 lg:gap-8"
          : "p-4 gap-4 md:gap-6 lg:gap-10"
      )}
    >
      {isEmpty(ratings) ? (
        <NoTutorRatings tutorName={tutorName} />
      ) : (
        <div className="grid gap-4 flex-wrap justify-center grid-cols-[repeat(auto-fill,minmax(256px,310px))] md:grid-cols-[repeat(auto-fill,minmax(194px,256px))] lg:grid-cols-[repeat(auto-fill,minmax(256px,1fr))]">
          {ratings.map((rating, index) => {
            if (
              "userId" in rating &&
              (rating.feedback || rating.userId === user?.id)
            )
              return (
                <TutorRatingCard
                  key={index}
                  feedback={rating.feedback}
                  imageUrl={rating.image}
                  rating={rating.value}
                  studentId={rating.userId}
                  studentName={rating.name}
                  tutorName={tutorName}
                  owner={rating.userId === user?.id}
                  onDelete={() => setDeleteDialog(rating.id)}
                  onEdit={() =>
                    setEditDialog({
                      id: rating.id,
                      studentName: rating.name || "",
                      studentId: rating.userId,
                      imageUrl: rating.image,
                      feedback: rating.feedback,
                      rating: rating.value,
                    })
                  }
                />
              );

            if ("ratings" in rating)
              return (
                <TutorRatingCardGroup
                  key={index}
                  ratings={rating.ratings.map((rating) => ({
                    userId: rating.userId,
                    name: rating.name,
                    imageUrl: rating.image,
                  }))}
                  tutorName={tutorName}
                  value={rating.value}
                />
              );
          })}
        </div>
      )}

      {deleteDialog ? (
        <DeleteRating
          loading={deleteMutation.isPending}
          open={!!deleteDialog}
          close={closeDelete}
          onDelete={() => deleteMutation.mutate(deleteDialog)}
        />
      ) : null}

      {editDialog ? (
        <RatingDialog
          title={intl("rating-dialog.rate-tutor.title")}
          header={intl("rating-dialog.rate-tutor.header", { tutor: tutorName })}
          description={intl("rating-dialog.rate-tutor.description")}
          submitting={editMutation.isPending}
          defaults={{
            feedback: editDialog.feedback,
            rating: editDialog.rating,
          }}
          close={closeEdit}
          maxAllowedCharacters={180}
          submit={editRating}
        />
      ) : null}

      {!currentUserRated && user?.role === IUser.Role.Student ? (
        <RateTutor tutorName={tutorName || ""} tutorId={id} />
      ) : null}
    </div>
  );
};

export default Ratings;
