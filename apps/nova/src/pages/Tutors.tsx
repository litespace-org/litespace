import TutorList from "@/components/Tutors/List";
import React from "react";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useFindTutors } from "@litespace/headless/tutor";

const Tutors: React.FC = () => {
  const intl = useFormatMessage();
  const tutors = useFindTutors({ size: 20 });

  return (
    <div className="w-full p-6 mx-auto max-w-screen-2xl">
      <Typography className="font-bold text-xl">
        {intl("nova.breadcrumbs.tutors")}
      </Typography>
      <TutorList tutors={tutors.query} {...tutors} goto={tutors.goto} />
    </div>
  );
};

export default Tutors;
