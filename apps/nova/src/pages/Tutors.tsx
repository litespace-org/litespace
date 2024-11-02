import TutorList from "@/components/Tutors/List";
import { atlas } from "@litespace/luna/lib";
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
    <div className="w-full p-6 mx-auto max-w-screen-2xl">
      <TutorList tutors={tutors} />
    </div>
  );
};

export default Tutors;
