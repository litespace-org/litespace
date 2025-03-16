import TutorCard from "@/components/Tutors/TutorCard";
import { router } from "@/lib/routes";
import { FindOnboardedTutorsApiResponse } from "@litespace/types/dist/esm/tutor";
import { Web } from "@litespace/utils/routes";
import React from "react";

const Content: React.FC<{
  tutors: FindOnboardedTutorsApiResponse["list"];
}> = ({ tutors }) => {
  if (!tutors) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-6">
      {tutors.slice(0, 2).map((tutor) => {
        const profileUrl = router.web({
          route: Web.TutorProfile,
          id: tutor.id,
          full: true,
        });

        return (
          <div
            key={tutor.id}
            className="max-w-[574px] lg:max-w-[600px] justify-self-center lg:first:justify-self-end lg:last:justify-self-start"
          >
            <TutorCard
              id={tutor.id}
              about={tutor.about}
              name={tutor.name}
              lessonCount={tutor.lessonCount}
              studentCount={tutor.studentCount}
              rating={tutor.avgRating}
              profileUrl={profileUrl}
              imageUrl={tutor.image}
              topics={tutor.topics}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Content;
