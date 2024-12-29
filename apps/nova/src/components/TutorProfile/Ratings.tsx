import {
  useDeleteRatingTutor,
  useEditRatingTutor,
  useFindTutorRatings,
} from "@litespace/headless/rating";
import React, { useCallback, useMemo, useState } from "react";
import { organizeRatings } from "@/lib/ratings";
import { useUserContext } from "@litespace/headless/context/user";
import {
  DeleteRating,
  RatingDialog,
  TutorRatingCard,
  TutorRatingCardGroup,
} from "@litespace/luna/TutorFeedback";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import NewTutor from "@litespace/assets/NewTutor";
import { isEmpty } from "lodash";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { useToast } from "@litespace/luna/Toast";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { RateTutor } from "@/components/TutorProfile/RateTutor";
import cn from "classnames";

const NoTutorRatings: React.FC<{ tutorName: string | null }> = ({
  tutorName,
}) => {
  const intl = useFormatMessage();
  return (
    <div className="flex tw-relative items-center justify-center h-[294px] w-full gap-[88px]">
      <Typography
        element="subtitle-1"
        weight="bold"
        className="text-natural-950 text-center -translate-y-7 max-w-[476px]"
      >
        {intl("tutor.profile.first-rating", { tutor: tutorName })}
      </Typography>
      <div className="w-[292px] h-[294px]">
        <NewTutor />
      </div>
    </div>
  );
};

const Ratings: React.FC<{ id: number; tutorName: string | null }> = ({
  id,
  tutorName,
}) => {
  const { user } = useUserContext();
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);

  const [editDialog, setEditDialog] = useState<{
    id: number;
    studentName: string;
    studentId: number;
    imageUrl: string;
    feedback: string | null;
    rating: number;
  } | null>(null);

  const closeDelete = useCallback(() => {
    setDeleteDialog(null);
  }, []);

  const onDeleteError = useCallback(
    () =>
      toast.error({
        title: intl("tutor.rating.delete.error"),
      }),
    [intl, toast]
  );

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

  const onEditError = useCallback(
    () =>
      toast.error({
        title: intl("tutor.rating.edit.error"),
      }),
    [intl, toast]
  );
  const editMutation = useEditRatingTutor({
    onSuccess: onEditSuccess,
    onError: onEditError,
  });

  const ratingsQuery = useFindTutorRatings(id, { page: 1, size: 30 });

  const { ratings, currentUserRated } = useMemo(
    () => organizeRatings(ratingsQuery.data?.list || [], user?.id),
    [ratingsQuery.data, user]
  );

  if (ratingsQuery.isLoading || ratingsQuery.isPending)
    return (
      <div className="h-96 flex justify-center items-center">
        <Loader size="medium" text={intl("tutor.profile.loading")} />
      </div>
    );

  if (ratingsQuery.error || !user)
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
        "flex flex-col justify-center p-8",
        isEmpty(ratings) ? "gap-8" : "gap-10"
      )}
    >
      {isEmpty(ratings) ? (
        <NoTutorRatings tutorName={tutorName} />
      ) : (
        <div className="grid gap-4 flex-wrap justify-center grid-cols-[repeat(auto-fill,minmax(256px,1fr))]">
          {ratings.map((rating, index) => {
            if (
              "userId" in rating &&
              (rating.feedback || rating.userId === user.id)
            )
              return (
                <TutorRatingCard
                  key={index}
                  feedback={rating.feedback}
                  imageUrl={asFullAssetUrl(rating.image || "")}
                  rating={rating.value}
                  studentId={rating.userId}
                  studentName={rating.name}
                  tutorName={tutorName}
                  owner={rating.userId === user.id}
                  onDelete={() => setDeleteDialog(rating.id)}
                  onEdit={() =>
                    setEditDialog({
                      id: rating.id,
                      studentName: rating.name || "",
                      studentId: rating.userId,
                      imageUrl: asFullAssetUrl(rating.image || ""),
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
                    imageUrl: asFullAssetUrl(rating.image || ""),
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
          {...editDialog}
          tutorName={tutorName || ""}
          onClose={closeEdit}
          loading={editMutation.isPending}
          open={!!editDialog}
          onSubmit={(payload: { value: number; feedback: string | null }) =>
            editMutation.mutate({
              id: editDialog.id,
              payload: {
                value: payload.value,
                feedback: payload.feedback || "",
              },
            })
          }
        />
      ) : null}

      {!currentUserRated ? (
        <RateTutor tutorName={tutorName || ""} tutorId={id} />
      ) : null}
    </div>
  );
};

export default Ratings;
