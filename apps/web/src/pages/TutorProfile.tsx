import { Loader, LoadingError } from "@litespace/ui/Loading";
import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import RightArrow from "@litespace/assets/ArrowRight";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TutorProfileCard } from "@litespace/ui/TutorProfile";
import { TutorTabs } from "@/components/TutorProfile/TutorTabs";
import ManageLesson from "@/components/Lessons/ManageLesson";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Web } from "@litespace/utils/routes";

const TutorProfile: React.FC = () => {
  const { lg } = useMediaQuery();
  const params = useParams<{ id: string }>();
  const intl = useFormatMessage();
  const [open, setOpen] = useState<boolean>(false);

  const id = useMemo(() => {
    const id = Number(params.id);
    if (Number.isNaN(id)) return null;
    return id;
  }, [params.id]);

  const tutor = useFindTutorInfo(id);

  return (
    <div className="w-full max-w-screen-3xl p-4 md:p-6 mx-auto md:mb-12">
      <div className="flex items-center gap-4 md:gap-6">
        <Link
          to={Web.Tutors}
          className="hidden md:flex w-6 h-6 items-center justify-center"
        >
          <RightArrow className="[&>*]:stroke-brand-700" />
        </Link>
        <Typography element="subtitle-2" className="font-bold text-natural-950">
          {intl("tutors.title")}
          {tutor.data?.name ? (
            <>
              <span> / </span>
              <span className="underline text-brand-700">
                {tutor.data.name}
              </span>
            </>
          ) : null}
        </Typography>
      </div>

      {tutor.isLoading ? (
        <div className="mt-[15vh]">
          <Loader
            size={lg ? "medium" : "small"}
            text={intl("tutor-profile.loading")}
          />
        </div>
      ) : null}

      {tutor.isError ? (
        <div className="mt-[15vh]">
          <LoadingError
            size={lg ? "medium" : "small"}
            error={intl("tutor-profile.error")}
            retry={tutor.refetch}
          />
        </div>
      ) : null}

      {!tutor.isLoading && !tutor.isError && tutor.data ? (
        <div className="md:bg-natural-50 md:border md:border-natural-100 md:shadow-tutor-profile md:rounded-2xl mt-4 md:mt-6 flex flex-col gap-8 md:gap-12">
          <TutorProfileCard {...tutor.data} onBook={() => setOpen(true)} />
          <TutorTabs tutor={tutor.data} />
        </div>
      ) : null}

      {open && tutor.data ? (
        <ManageLesson
          type="book"
          tutorId={tutor.data.id}
          close={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default TutorProfile;
