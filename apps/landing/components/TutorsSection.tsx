import React from "react";
import { api } from "@/lib/api";
import { isEmpty } from "lodash";
import { Tutors } from "@/components/Tutors";

export const TutorsSection: React.FC = async () => {
  const tutors = await api.user
    .findOnboardedTutors({
      page: 1,
      size: 4,
    })
    .catch(() => ({ list: [], total: 0 }));

  if (isEmpty(tutors.list)) return null;

  return <Tutors tutors={tutors} />;
};

export default TutorsSection;
