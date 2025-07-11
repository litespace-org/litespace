import TutorCard from "@/components/Tutors/TutorCard";
import { router } from "@/lib/routes";
import { ITutor, IUser } from "@litespace/types";
import { Web } from "@litespace/utils/routes";
import React from "react";

const Content: React.FC<{
  tutors: ITutor.FindOnboardedTutorsApiResponse["list"];
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
            className="w-full md:max-w-[276px] lg:max-h-[393px] justify-self-center lg:first:justify-self-end lg:last:justify-self-start"
          >
            <TutorCard
              id={tutor.id}
              about={tutor.about}
              name={tutor.name}
              rating={tutor.avgRating}
              profileUrl={profileUrl}
              imageUrl={tutor.image}
              free={tutor.role === IUser.Role.TutorManager}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Content;
