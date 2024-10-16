import TutorList from "@/components/Tutors/List";
import { atlas } from "@litespace/luna";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const Tutors: React.FC = () => {
  // todo: impl. pagination
  const tutors = useQuery({
    queryFn: async () => await atlas.user.findOnboardedTutors(),
    queryKey: ["find-onboarded-tutors"],
    retry: false,
  });

  return (
    <div className="max-w-screen-2xl mx-auto w-full p-6">
      <TutorList tutors={tutors} />
    </div>
  );
};

export default Tutors;
