import { Loading } from "@litespace/ui/Loading";
import React, { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import RightArrow from "@litespace/assets/ArrowRight";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TutorProfileCard } from "@litespace/ui/TutorProfile";
import { TutorTabs } from "@/components/TutorProfile/TutorTabs";
import BookLesson from "@/components/Lessons/BookLesson";
import { Route } from "@/types/routes";
import { useMediaQueries } from "@litespace/luna/hooks/media";

const TutorProfile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const intl = useFormatMessage();
  const [open, setOpen] = useState<boolean>(false);
  const closeDialog = useCallback(() => setOpen(false), []);
  const openDialog = useCallback(() => setOpen(true), []);
  const id = useMemo(() => {
    const id = Number(params.id);
    if (Number.isNaN(id)) return null;
    return id;
  }, [params.id]);

  const tutor = useFindTutorInfo(id);

  const { md } = useMediaQueries();

  if (tutor.isLoading) return <Loading className="h-[40vh]" />;

  // TODO: Need to implement error state
  if (!tutor.data || tutor.error) return null;
  return (
    <div className="w-full max-w-screen-3xl p-6 mx-auto md:mb-12">
      <div className="flex items-center gap-4 md:gap-6">
        <Link
          to={Route.Tutors}
          className="hidden md:flex w-6 h-6 items-center justify-center"
        >
          <RightArrow className="[&>*]:stroke-brand-700" />
        </Link>
        <Typography
          element={md ? "subtitle-2" : "body"}
          className="font-bold text-natural-950"
        >
          {intl("tutors.title")} /{" "}
          <span className="underline text-brand-700">{tutor.data.name}</span>
        </Typography>
      </div>
      <div className="md:bg-natural-50 md:border md:border-natural-100 md:shadow-tutor-profile md:rounded-2xl mt-4 md:mt-6 flex flex-col gap-8 md:gap-12">
        <TutorProfileCard {...tutor.data} onBook={openDialog} />
        <TutorTabs tutor={tutor.data} />
        <BookLesson tutorId={tutor.data.id} close={closeDialog} open={open} />
      </div>
    </div>
  );
};

export default TutorProfile;
