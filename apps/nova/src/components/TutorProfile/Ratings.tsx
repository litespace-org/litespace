import { Loading, Timeline, TimelineItem } from "@litespace/luna";
import { IRating } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import React, { useMemo, useState, useCallback } from "react";
import { Star } from "react-feather";
import Title from "@/components/TutorProfile/Title";
import Rating from "@/components/TutorProfile/Rating";
import EditRating from "@/components/TutorProfile/EditRating";
import DeleteRating from "@/components/TutorProfile/DeleteRating";

const Ratings: React.FC<{
  query: UseQueryResult<IRating.Populated[], Error>;
}> = ({ query }) => {
  const [editRating, setEditRating] = useState<IRating.Populated | null>(null);
  const [deleteRating, setDeleteRating] = useState<{
    ratingId: number;
    tutorId: number;
  } | null>(null);

  const onEditRating = useCallback(
    (rating: IRating.Populated) => setEditRating(rating),
    []
  );

  const onDeleteRating = useCallback(
    (payload: { ratingId: number; tutorId: number }) =>
      setDeleteRating(payload),
    []
  );

  const onClose = useCallback(() => {
    setEditRating(null);
    setDeleteRating(null);
  }, []);

  const timeline = useMemo((): TimelineItem[] => {
    if (!query.data) return [];

    return query.data.map((rating) => ({
      id: rating.id,
      children: (
        <Rating
          rating={rating}
          onEdit={onEditRating}
          onDelete={onDeleteRating}
        />
      ),
      icon: <Star />,
    }));
  }, [query.data]);

  if (query.isLoading) return <Loading className="h-60" />;
  if (query.isError) return <h1>Error</h1>;
  if (!query.data) return null;

  return (
    <div>
      <Title id="labels.ratings" />
      <Timeline timeline={timeline} />
      {editRating ? (
        <EditRating open close={onClose} rate={editRating} />
      ) : null}
      {deleteRating ? (
        <DeleteRating
          tutorId={deleteRating.tutorId}
          open
          close={onClose}
          id={deleteRating.ratingId}
        />
      ) : null}
    </div>
  );
};

export default Ratings;
