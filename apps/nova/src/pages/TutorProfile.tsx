import { Loading } from "@litespace/luna/components/Loading";
import { asOnlineStatus } from "@litespace/luna/components/utils";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Image, Video } from "@/components/TutorProfile/Media";
import Stats from "@/components/TutorProfile/Stats";
import About from "@/components/TutorProfile/About";
import ActivitiesOverview from "@/components/TutorProfile/ActivitiesOverview";
import Ratings from "@/components/TutorProfile/Ratings";
import RateForm from "@/components/TutorProfile/RateForm";
import { useFindRatingTutor } from "@litespace/headless/rating";
import {
  useFindTutorActivityScore,
  useFindTutorById,
  useFindTutorStats,
} from "@litespace/headless/tutor";
const TutorProfile: React.FC = () => {
  const params = useParams<{ id: string }>();

  const id = useMemo(() => {
    const id = Number(params.id);
    if (Number.isNaN(id)) return null;
    return id;
  }, [params.id]);

  const tutor = useFindTutorById(id);

  const stats = useFindTutorStats(id);

  const activity = useFindTutorActivityScore(id);

  const ratings = useFindRatingTutor(tutor.data?.id!);

  if (tutor.isLoading) return <Loading className="h-[40vh]" />;
  if (tutor.isError || !tutor.data) return <h1>Error</h1>;

  return (
    <div className="w-full max-w-screen-sm p-6 mx-auto mb-12 lg:max-w-screen-2xl">
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-col items-center justify-center gap-5 text-center lg:justify-start">
          <Image
            image={tutor.data.image}
            status={asOnlineStatus(tutor.data.online, tutor.data.updatedAt)}
          />
          <div>
            <h3 className="text-2xl leading-relaxed">{tutor.data.name}</h3>
            <p className="text-foreground-light">{tutor.data.bio}</p>
          </div>
          <Video video={tutor.data.video} />
        </div>

        <div className="flex flex-col gap-5">
          <Stats query={stats} />
          <About about={tutor.data.about} />
          <ActivitiesOverview query={activity} />
          <Ratings query={ratings} />
          <RateForm tutor={tutor.data.id} />
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
