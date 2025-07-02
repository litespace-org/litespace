import React, { useMemo } from "react";
import { first } from "lodash";
import Pending from "@/components/TutorOnboarding/Steps/IntroVideo/Pending";
import { Record } from "@/components/TutorOnboarding/Steps/IntroVideo/Record";
import Rejected from "@/components/TutorOnboarding/Steps/IntroVideo/Rejected";
import { useFindLastIntroVideo } from "@litespace/headless/introVideos";
import { IIntroVideo, Void } from "@litespace/types";
import { dayjs } from "@/lib/dayjs";
import { INTRO_VIDEO_EXPIRY_MONTHS } from "@litespace/utils";

const IntroVideo: React.FC<{ tutorId: number; next: Void }> = ({
  tutorId,
  next,
}) => {
  const introVideoQuery = useFindLastIntroVideo(tutorId);

  const lastIntroVideo = useMemo(() => {
    return first(introVideoQuery.data?.main.list);
  }, [introVideoQuery.data]);

  if (lastIntroVideo?.state === IIntroVideo.State.Pending) return <Pending />;

  if (
    lastIntroVideo?.state === IIntroVideo.State.Rejected &&
    dayjs().diff(lastIntroVideo.createdAt, "month") < INTRO_VIDEO_EXPIRY_MONTHS
  )
    return <Rejected />;

  if (lastIntroVideo?.state === IIntroVideo.State.Approved) next();

  return <Record />;
};

export default IntroVideo;
