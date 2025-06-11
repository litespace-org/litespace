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
    <div className="flex flex-wrap justify-center lg:flex-row gap-6 md:gap-4 lg:gap-6">
      {tutors.map((tutor) => {
        const profileUrl = router.web({
          route: Web.TutorProfile,
          id: tutor.id,
          full: true,
        });

        return (
          <div
            key={tutor.id}
            className="w-full sm:w-2/5 lg:flex-1 max-w-[574px] lg:max-w-[600px] justify-self-center lg:first:justify-self-end lg:last:justify-self-start"
          >
            <TutorCard
              id={tutor.id}
              about={tutor.about}
              name={tutor.name}
              rating={tutor.avgRating}
              profileUrl={profileUrl}
              imageUrl={tutor.image}
              // @TODO: extend the cache to include the role value
              free={true}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Content;
