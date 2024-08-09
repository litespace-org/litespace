import { atlas } from "@/lib/atlas";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

const TutorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading, isError, data } = useQuery({
    queryFn: () => atlas.tutor.findById(Number(id)),
  });

  if (isLoading) return <h1>Loading...</h1>;

  return <div>TutorProfile</div>;
};

export default TutorProfile;
