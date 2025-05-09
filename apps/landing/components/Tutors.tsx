import Content from "@/components/Tutors/Content";
import { api } from "@/lib/api";
import { formatMessage } from "@/lib/intl";
import { Typography } from "@litespace/ui/Typography";
import React from "react";
import InViewTrack from "@/components/Common/InViewTrack";

export const Tutors: React.FC = async () => {
  const intl = await formatMessage();
  const tutors = await api.user
    .findOnboardedTutors({
      page: 1,
      size: 2,
    })
    .catch(() => {
      return { list: [], total: 0 };
    });

  return (
    <div className="bg-secondary-50 w-screen">
      <InViewTrack event="view_item_list" label="tutors" action="scroll" />
      <div className="py-14 md:py-20 lg:py-[120px] max-w-screen-3xl mx-auto px-4 md:px-8">
        <div className="mx-auto text-center flex flex-col gap-4 mb-8 md:mb-16 lg:mb-[68px] max-w-[874px]">
          <Typography
            tag="h3"
            className="text-subtitle-1 md:text-h4 lg:text-h3 font-bold text-natural-950"
          >
            {intl("home/tutors/title")}
          </Typography>
          <Typography
            tag="h6"
            className="text-body md:text-subtitle-2 font-medium md:font-semibold  text-natural-700"
          >
            {intl("home/tutors/description")}
          </Typography>
        </div>
        <Content tutors={tutors.list} />
      </div>
    </div>
  );
};

export default Tutors;
