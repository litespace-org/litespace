import { Loading } from "@litespace/luna/Loading";
import React, { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import RightArrow from "@litespace/assets/ArrowRight";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { TutorProfileCard } from "@litespace/luna/TutorProfile";
import { TutorTabs } from "@/components/TutorProfile/TutorTabs";
import BookLesson from "@/components/Lessons/BookLesson";
import { Route } from "@/types/routes";

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

  if (tutor.isLoading) return <Loading className="h-[40vh]" />;

  // TODO: Need to implement error state
  if (!tutor.data || tutor.error) return null;
  return (
    <div className="w-full max-w-screen-3xl p-6 mx-auto mb-12 lg:max-w-screen-3xl">
      <div className="flex items-center gap-6">
        <Link
          to={Route.Tutors}
          className="w-6 h-6 flex items-center justify-center"
        >
          <RightArrow className="[&>*]:stroke-brand-700" />
        </Link>
        <Typography element="subtitle-2" className="font-bold text-natural-950">
          {intl("tutors.title")} /{" "}
          <span className="underline text-brand-700">{tutor.data.name}</span>
        </Typography>
      </div>
      <div className="bg-natural-50 border border-natural-100 shadow-tutor-profile rounded-2xl p-10 mt-6">
        <TutorProfileCard {...tutor.data} onBook={openDialog} />
        <TutorTabs tutor={tutor.data} />
        <BookLesson
          user={{
            tutorId: tutor.data.id,
            imageUrl: tutor.data.image,
            name: tutor.data.name,
            // TODO: Remove it when we add the changes to the server
            notice: tutor.data.notice || 30,
          }}
          close={closeDialog}
          open={open}
        />
      </div>
    </div>
  );
};

export default TutorProfile;
