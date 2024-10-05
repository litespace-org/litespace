import { atlas } from "@/lib/atlas";
import { asOnlineStatus, Loading } from "@litespace/luna";
import React, { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Image, Video } from "@/components/TutorProfile/Media";
import Stats from "@/components/TutorProfile/Stats";
import About from "@/components/TutorProfile/About";
import ActivitiesOverview from "@/components/TutorProfile/ActivitiesOverview";

const TutorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tutor = useQuery({
    queryKey: ["tutor-profile"],
    queryFn: () => atlas.tutor.findById(Number(id)),
    retry: false,
  });

  const findTutorStats = useCallback(() => {
    if (!tutor.data) return null;
    return atlas.user.findTutorStats(tutor.data.id);
  }, [tutor.data]);

  const findTutorAcivityScores = useCallback(() => {
    if (!tutor.data) return null;
    return atlas.user.findTutorActivityScores(tutor.data.id);
  }, [tutor.data]);

  const stats = useQuery({
    queryFn: findTutorStats,
    queryKey: ["tutor-stats"],
    enabled: !!tutor.data,
  });

  const activity = useQuery({
    queryFn: findTutorAcivityScores,
    queryKey: ["tutor-acivity"],
    enabled: !!tutor.data,
  });

  // const ratings = useQuery({
  //   queryKey: ["tutor-rating"],
  //   queryFn: async () => {
  //     if (!tutor.data?.id) return [];
  //     return await atlas.rating.findRateeRatings(tutor.data.id);
  //   },
  //   enabled: !!tutor.data,
  //   retry: false,
  // });

  if (tutor.isLoading) return <Loading className="h-[40vh]" />;
  if (tutor.isError || !tutor.data) return <h1>Error</h1>;

  return (
    <div className="max-w-screen-xl mx-auto w-full p-6 mb-12 flex flex-col gap-5">
      <div className="flex flex-col items-center justify-center text-center gap-5">
        <Image
          image={tutor.data.image}
          status={asOnlineStatus(tutor.data.online, tutor.data.updatedAt)}
        />

        <div>
          <h3 className="text-2xl leading-relaxed">{tutor.data.name}</h3>
          <p className="text-foreground-light">{tutor.data.bio}</p>
        </div>
      </div>

      <div>
        <Video video={tutor.data.video} />
      </div>

      <Stats query={stats} />
      <About about={tutor.data.about} />
      <ActivitiesOverview query={activity} />
    </div>
  );
};

export default TutorProfile;
