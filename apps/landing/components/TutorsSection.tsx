import React from "react";
import { api } from "@/lib/api";
import { isEmpty } from "lodash";
import { Tutors } from "@/components/Tutors";
import {
  isValidTutorAbout,
  isValidTutorBio,
  isValidTutorName,
} from "@litespace/utils";

export const TutorsSection: React.FC = async () => {
  const tutors = await api.user
    .findOnboardedTutors({
      page: 1,
      size: 4,
    })
    .catch(() => ({ list: [], total: 0 }));

  const list = tutors.list.filter(
    (tutor) =>
      isValidTutorName(tutor.name) === true &&
      isValidTutorBio(tutor.bio) === true &&
      isValidTutorAbout(tutor.about) === true
  );

  if (isEmpty(list)) return null;

  return <Tutors tutors={list} />;
};

export default TutorsSection;
