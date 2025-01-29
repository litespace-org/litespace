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
    <div className="grid grid-cols-2 py-8 gap-[88px] p-8 px-10">
      <div>
        {about ? (
          <div>
            <Typography
              weight="bold"
              element="subtitle-2"
              className="text-natural-950 mb-8"
            >
              {intl("tutor.profile.tabs.profile.about")}
            </Typography>
            <Typography element="body" className="text-natural-800">
              {about}
            </Typography>
          </div>
        ) : null}
        {!isEmpty(topics) ? (
          <div className="mt-8">
            <Typography
              element="subtitle-2"
              className="text-natural-950 font-bold mb-8"
            >
              {intl("tutor.profile.tabs.profile.specialities")}
            </Typography>
            <div className="flex items-center gap-4 flex-wrap">
              {topics.map((topic) => (
                <div
                  key={topic}
                  className="py-3 px-4 bg-brand-700 rounded-3xl text-center"
                >
                  <Typography element="caption" className="text-natural-50">
                    {topic}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {video ? (
        <div>
          <Typography
            element="subtitle-2"
            className="text-natural-950 font-bold mb-8"
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
