"use client";

import Content from "@/components/Tutors/Content";
import { Typography } from "@litespace/ui/Typography";
import React from "react";
import InViewTrack from "@/components/Common/InViewTrack";
import { ITutor } from "@litespace/types";
import { Highlight } from "@/components/Common/Highlight";

export const Tutors: React.FC<{
  tutors: ITutor.FindOnboardedTutorsApiResponse;
}> = ({ tutors }) => {
  return (
    <div className="bg-natural-0 max-w-screen">
      <InViewTrack event="view_item_list" label="tutors" action="scroll" />
      <div className="py-14 md:py-20 lg:py-[120px] max-w-screen-3xl mx-auto px-4 md:px-8">
        <div className="mx-auto text-center flex flex-col gap-4 mb-8 md:mb-16 lg:mb-[68px] max-w-[874px]">
          <Typography
            tag="h3"
            className="text-subtitle-1 md:text-h4 lg:text-h3 font-bold text-natural-950"
          >
            <Highlight id="home/tutors/title" />
          </Typography>
          <Typography
            tag="h6"
            className="text-body md:text-subtitle-2 font-medium md:font-semibold  text-natural-700"
          >
            <Highlight id="home/tutors/description" />
          </Typography>
        </div>

        <Content tutors={tutors.list} />
      </div>
    </div>
  );
};
