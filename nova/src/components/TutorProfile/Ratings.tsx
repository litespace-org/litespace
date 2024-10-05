import { Loading, Timeline, TimelineItem } from "@litespace/luna";
import { IRating } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { Star } from "react-feather";
import Title from "./Title";
import Rating from "./Rating";

const Ratings: React.FC<{
  query: UseQueryResult<IRating.Populated[], Error>;
}> = ({ query }) => {
  const timeline = useMemo((): TimelineItem[] => {
    if (!query.data) return [];
    return query.data.map((rating) => ({
      id: rating.id,
      children: <Rating rating={rating} />,
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
    </div>
  );
};

export default Ratings;
