import * as Tabs from "@radix-ui/react-tabs";
import { VideoPlayer } from "@litespace/luna/VideoPlayer";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { isEmpty } from "lodash";
import { Typography } from "@litespace/luna/Typography";
import { ITutor } from "@litespace/types";

export const TutorTabs: React.FC<{
  tutor: ITutor.FindTutorInfoApiResponse;
}> = ({ tutor }) => {
  const intl = useFormatMessage();
  return (
    <div className="mt-12">
      <Tabs.Root defaultValue="profile">
        <Tabs.List className="border-b border-natural-300 flex gap-[56px] ">
          <Tabs.Trigger
            value="profile"
            className=" data-[state=active]:border-b-[3px] border-brand-700 py-2 rounded-t-[10px]"
          >
            <Typography element="body" className="text-brand-700 font-semibold">
              {intl("tutor.profile.tabs.profile")}
            </Typography>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="reviews"
            className=" data-[state=active]:border-b-[3px] border-brand-700 py-2 rounded-t-[10px]"
          >
            <Typography element="body" className="text-brand-700 font-semibold">
              {intl("tutor.profile.tabs.reviews")}
            </Typography>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="profile"
          className="grid grid-cols-2 gap-[88px] mt-8"
        >
          <div>
            {tutor.about ? (
              <div>
                <Typography
                  element="subtitle-2"
                  className="text-natural-950 font-bold mb-8"
                >
                  {intl("tutor.profile.tabs.profile.about")}
                </Typography>
                <Typography element="body" className="text-natural-800">
                  {tutor.about}
                </Typography>
              </div>
            ) : null}
            {!isEmpty(tutor.topics) ? (
              <div className="mt-8">
                <Typography
                  element="subtitle-2"
                  className="text-natural-950 font-bold mb-8"
                >
                  {intl("tutor.profile.tabs.profile.specialities")}
                </Typography>
                <div className="flex items-center gap-4 flex-wrap">
                  {tutor.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="py-3 px-4 bg-brand-700 rounded-3xl text-center"
                    >
                      <Typography
                        element="caption"
                        className="text-natural-50 "
                      >
                        {topic}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          {tutor.video ? (
            <div>
              <Typography
                element="subtitle-2"
                className="text-natural-950 font-bold mb-8"
              >
                {intl("tutor.profile.tabs.profile.video")}
              </Typography>
              <VideoPlayer src={tutor.video} />
            </div>
          ) : null}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
