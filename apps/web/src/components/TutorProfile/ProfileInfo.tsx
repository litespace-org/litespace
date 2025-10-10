import { StudentDashboardTour } from "@/constants/tour";
import { track } from "@/lib/ga";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import { optional } from "@litespace/utils/utils";
import { isEmpty } from "lodash";
import React from "react";

const ProfileInfo: React.FC<{
  about: string | null;
  topics: string[];
  video: string | null;
}> = ({ about, topics, video }) => {
  const intl = useFormatMessage();
  const { md } = useMediaQuery();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 pt-4 md:pt-6 md:pb-10 md:px-10 lg:pt-8 gap-4 md:gap-6 lg:gap-[88px]">
      {video && !md ? (
        <div className="flex flex-col gap-2 md:gap-4">
          <Typography
            tag="span"
            className="text-natural-950 font-bold text-body lg:text-subtitle-2"
          >
            {intl("tutor.profile.tabs.profile.video")}
          </Typography>
          <VideoPlayer
            onPlay={() => {
              track("play_tutor_video", "tutor_profile");
            }}
            src={optional(video)}
          />
        </div>
      ) : null}
      <div>
        {about ? (
          <div className="flex flex-col gap-2 md:gap-4">
            <Typography
              tag="h2"
              className="text-natural-950 text-body lg:text-subtitle-2 font-bold"
            >
              {intl("tutor.profile.tabs.profile.about")}
            </Typography>
            <Typography
              tag="p"
              className="text-natural-800 break-words text-tiny md:text-caption lg:text-body font-normal"
            >
              {about}
            </Typography>
          </div>
        ) : null}
        {!isEmpty(topics) ? (
          <div
            id={StudentDashboardTour.stepId(2)}
            className="mt-4 md:mt-6 lg:mt-8 flex flex-col gap-2 md:gap-4"
          >
            <Typography
              tag="span"
              className="text-natural-950 text-body lg:text-subtitle-2 font-bold"
            >
              {intl("tutor.profile.tabs.profile.specialities")}
            </Typography>
            <div className="flex items-center gap-2 flex-wrap">
              {topics.map((topic) => (
                <div
                  key={topic}
                  className="p-[10px] px-3 py-2 bg-natural-50 rounded-3xl text-center border border-natural-500"
                >
                  <Typography
                    tag="span"
                    className="text-natural-500 text-tiny md:text-caption font-normal"
                  >
                    {topic}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {video && md ? (
        <div className="flex flex-col gap-2 md:gap-4">
          <Typography
            tag="span"
            className="text-natural-950 font-bold text-body lg:text-subtitle-2"
          >
            {intl("tutor.profile.tabs.profile.video")}
          </Typography>
          <VideoPlayer
            onPlay={() => {
              track("play_tutor_video", "tutor_profile");
            }}
            src={optional(video)}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ProfileInfo;
