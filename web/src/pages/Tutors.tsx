import tutor from "@/api/tutor";
import React from "react";
import { useQuery } from "react-query";

const Tutors: React.FC = () => {
  const query = useQuery({
    queryFn: tutor.findAll,
    retry: false,
  });

  return (
    <div className="max-w-screen-md my-10">
      {query.data?.map((tutor) => (
        <div key={tutor.id}>
          <pre dir="ltr">{JSON.stringify(tutor, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default Tutors;
