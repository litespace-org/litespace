import TutorList from "@/components/Tutors/List";
import { atlas } from "@/lib/atlas";
import React from "react";
import { useQuery } from "react-query";

const Tutors: React.FC = () => {
  const tutors = useQuery({
    queryFn: async () => await atlas.user.findAvailableTutors(),
    queryKey: "find-available-tutors",
  });

  return (
    <div className="max-w-screen-2xl mx-auto w-full my-10">
      <TutorList tutors={tutors} />
    </div>
  );
};

export default Tutors;
