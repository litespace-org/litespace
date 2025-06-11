import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Dashboard } from "@litespace/utils/routes";
import ChevronRight from "@litespace/assets/ChevronRight";
import { useFindStudioTutor } from "@litespace/headless/tutor";
import {
  AvatarSection,
  ThumbnailSection,
  VideoSection,
} from "@/components/PhotoSession";

const PhotoSession = () => {
  const intl = useFormatMessage();
  const params = useParams<{ tutorId: string }>();

  const tutorId = useMemo(() => {
    const id = Number(params.tutorId);
    if (Number.isNaN(id)) return null;
    return id;
  }, [params]);

  const { query: tutorQuery } = useFindStudioTutor(tutorId);

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6 mb-10">
      <div className="flex items-center w-full gap-6 mb-6">
        <Link to={Dashboard.PhotoSessions}>
          <ChevronRight className="w-6 h-6 stroke-brand-700" />
        </Link>
        {tutorQuery.data?.name ? (
          <Typography tag="h1" className="text-subtitle-2 font-bold">
            {intl("dashboard.photo-sessions.title")}
            {" / "}
            <Typography
              tag="span"
              className="text-subtitle-2 font-bold text-brand-700 underline"
            >
              {tutorQuery.data?.name}
            </Typography>
          </Typography>
        ) : null}
      </div>

      <div className="flex flex-col gap-10">
        <AvatarSection tutor={tutorQuery.data} refetch={tutorQuery.refetch} />

        <VideoSection
          tutorId={tutorId}
          video={tutorQuery.data?.video || null}
          refetch={tutorQuery.refetch}
        />

        <ThumbnailSection
          tutorId={tutorId}
          thumbnail={tutorQuery.data?.thumbnail || null}
          refetch={tutorQuery.refetch}
        />
      </div>
    </div>
  );
};

export default PhotoSession;
