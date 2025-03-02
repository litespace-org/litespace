"use client";

import TutorCard from "@/components/Tutors/TutorCard";
import { router } from "@/lib/routes";
import { FindOnboardedTutorsApiResponse } from "@litespace/types/dist/esm/tutor";
import { Web } from "@litespace/utils/routes";
import { motion } from "framer-motion";
import React from "react";

const Content: React.FC<{
  tutors: FindOnboardedTutorsApiResponse;
}> = ({ tutors }) => {
  if (!tutors) return null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-6">
      {tutors.list.slice(0, 2).map((tutor) => {
        const profileUrl = router.web({
          route: Web.TutorProfile,
          id: tutor.id,
          full: true,
        });

        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={tutor.id}
            className="max-w-[574px] lg:max-w-[600px] justify-self-center lg:first:justify-self-end lg:last:justify-self-start"
          >
            <TutorCard
              id={tutor.id}
              bio={tutor.bio}
              about={tutor.about}
              name={tutor.name}
              lessonCount={tutor.lessonCount}
              studentCount={tutor.studentCount}
              rating={tutor.avgRating}
              profileUrl={profileUrl}
              imageUrl={tutor.image}
              topics={tutor.topics}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default Content;
