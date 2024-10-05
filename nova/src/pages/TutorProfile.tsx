import { atlas } from "@/lib/atlas";
import { asOnlineStatus, Loading } from "@litespace/luna";
import React, { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Image, Video } from "@/components/TutorProfile/Media";
import Stats from "@/components/TutorProfile/Stats";
import About from "@/components/TutorProfile/About";
import ActivitiesOverview from "@/components/TutorProfile/ActivitiesOverview";
import Ratings from "@/components/TutorProfile/Ratings";

const TutorProfile: React.FC = () => {
  const params = useParams<{ id: string }>();

  const id = useMemo(() => {
    const id = Number(params.id);
    if (Number.isNaN(id)) return null;
    return id;
  }, [params.id]);

  const findTutoById = useCallback(() => {
    if (!id) return null;
    return atlas.tutor.findById(id);
  }, [id]);

  const tutor = useQuery({
    queryKey: ["tutor-profile", id],
    queryFn: findTutoById,
    retry: false,
    enabled: !!id,
  });

  const findTutorStats = useCallback(() => {
    if (!id) return null;
    return atlas.user.findTutorStats(id);
  }, [id]);

  const stats = useQuery({
    queryFn: findTutorStats,
    queryKey: ["tutor-stats", id],
    enabled: !!id,
  });

  const findTutorAcivityScores = useCallback(() => {
    if (!id) return null;
    return atlas.user.findTutorActivityScores(id);
  }, [id]);

  const activity = useQuery({
    queryFn: findTutorAcivityScores,
    queryKey: ["tutor-acivity", id],
    enabled: !!id,
  });

  const findRateeRatings = useCallback(async () => {
    if (!id) return [];
    return atlas.rating.findRateeRatings(id);
  }, [id]);

  const ratings = useQuery({
    queryKey: ["tutor-rating", id],
    queryFn: findRateeRatings,
    enabled: !!id,
    retry: false,
  });

  if (tutor.isLoading) return <Loading className="h-[40vh]" />;
  if (tutor.isError || !tutor.data) return <h1>Error</h1>;

  return (
    <div className="max-w-screen-sm lg:max-w-screen-2xl mx-auto w-full p-6 mb-12">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex flex-col items-center justify-center lg:justify-start text-center gap-5">
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
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
