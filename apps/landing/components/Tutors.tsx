"use client";

import { useFormatMessage } from "@/hooks/intl";
import { useTutors } from "@litespace/headless/tutor";
import { Typography } from "@litespace/ui/Typography";
import React from "react";
import Content from "./Tutors/Content";
import { AtlasProvider, useAtlas } from "@litespace/headless/atlas";

export const Tutors: React.FC = () => {
  const intl = useFormatMessage();

  const tutors = useTutors();

  return (
    <AtlasProvider>
      <div className="bg-secondary-50 py-14 md:py-20 lg:py-[120px] max-w-screen-3xl mx-auto">
        <div className="mx-auto text-center flex flex-col gap-4 mb-8 md:mb-16 lg:mb-[68px] max-w-[874px]">
          <Typography
            tag="h3"
            className="text-subtitle-1 md:text-h3 font-bold text-natural-950"
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

        <Content
          tutors={tutors.list}
          loading={tutors.query.isLoading}
          fetching={tutors.query.isFetching && !tutors.query.isLoading}
          error={tutors.query.isError}
          more={tutors.more}
          hasMore={tutors.query.hasNextPage && !tutors.query.isPending}
          refetch={tutors.query.refetch}
        />
      </div>
    </AtlasProvider>
  );
};

export default Tutors;
