import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";
import { orUndefined } from "@litespace/utils/utils";
import { isEmpty } from "lodash";
import React from "react";

const ProfileInfo: React.FC<{
  about: string | null;
  topics: string[];
  video: string | null;
}> = ({ about, topics, video }) => {
  const intl = useFormatMessage();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 py-4 md:py-8 gap-4 md:gap-[88px] md:px-10">
      <div>
        {about ? (
          <div className="flex flex-col gap-2 md:gap-8">
            <Typography
              weight="bold"
              element={{ default: "body", md: "subtitle-2" }}
              className="text-natural-950"
            >
              {intl("tutor.profile.tabs.profile.about")}
            </Typography>
            <Typography
              element={{ default: "tiny-text", md: "body" }}
              className="text-natural-800 break-words"
            >
              {about}
            </Typography>
          </div>
        ) : null}
        {!isEmpty(topics) ? (
          <div className="mt-[34px] md:mt-8 flex flex-col md:gap-8 gap-2">
            <Typography
              element={{ default: "body", md: "subtitle-2" }}
              weight="bold"
              className="text-natural-950"
            >
              {intl("tutor.profile.tabs.profile.specialities")}
            </Typography>
            <div className="flex items-center gap-[10px] md:gap-4 flex-wrap">
              {topics.map((topic) => (
                <div
                  key={topic}
                  className="p-[10px] md:py-3 md:px-4 bg-brand-700 rounded-3xl text-center"
                >
                  <Typography
                    element={{ default: "tiny-text", md: "caption" }}
                    className="text-natural-50"
                  >
                    {topic}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {video ? (
        <div className="flex flex-col md:gap-8 gap-2">
          <Typography
            element={{ default: "body", md: "subtitle-2" }}
            className="text-natural-950 font-bold"
          >
            {intl("tutor.profile.tabs.profile.video")}
          </Typography>
          <VideoPlayer src={orUndefined(video)} />
        </div>
      ) : null}
    </div>
  );
};

export default ProfileInfo;
