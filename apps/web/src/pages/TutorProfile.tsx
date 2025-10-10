import { Loading, LoadingError } from "@litespace/ui/Loading";
import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import RightArrowHead from "@litespace/assets/RightArrowHead";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { TutorTabs } from "@/components/TutorProfile/TutorTabs";
import ManageLesson from "@/components/Lessons/ManageLesson";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Web } from "@litespace/utils/routes";
import ProfileCard from "@/components/TutorProfile/ProfileCard";
import { useUser } from "@litespace/headless/context/user";
import { router } from "@/lib/routes";
import { track } from "@/lib/ga";

const TutorProfile: React.FC = () => {
  const { md, lg } = useMediaQuery();
  const params = useParams<{ id: string }>();
  const intl = useFormatMessage();
  const [open, setOpen] = useState<boolean>(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const id = useMemo(() => {
    const id = Number(params.id);
    if (Number.isNaN(id)) return null;
    return id;
  }, [params.id]);

  const tutor = useFindTutorInfo(id || undefined);

  useEffect(() => {
    if (searchParams.get("book")) setOpen(true);
  }, [searchParams, setSearchParams]);

  return (
    <div className="w-full max-w-screen-3xl p-4 lg:p-6 mx-auto">
      <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
        {md ? (
          <Link
            to={Web.Tutors}
            className="hidden md:flex w-6 h-6 items-center justify-center"
          >
            <RightArrowHead className="[&>*]:stroke-brand-500 w-6 h-6" />
          </Link>
        ) : null}
        <Typography
          tag="h1"
          className="font-bold text-natural-950 text-body md:text-subtitle-2"
        >
          {intl("tutors.title")}
          {tutor.data?.name ? (
            <>
              <span>/ </span>
              <span className=" text-brand-500 inline-block underline">
                {tutor.data.name}
              </span>
            </>
          ) : null}
        </Typography>
      </div>

      {tutor.isLoading ? (
        <div className="mt-[15vh]">
          <Loading
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
        <div className="flex flex-col gap-8 md:gap-14 lg:gap-12">
          <ProfileCard
            {...tutor.data}
            onBook={() => {
              track("book_lesson", "tutor_profile");
              if (!tutor.data) return;
              if (!user)
                return navigate(
                  router.web({
                    route: Web.Login,
                    query: {
                      redirect: router.web({
                        route: Web.TutorProfile,
                        id: tutor.data.id,
                      }),
                      book: "true",
                      ...Object.fromEntries(searchParams),
                    },
                  })
                );

              setOpen(true);
            }}
          />
          <TutorTabs tutor={tutor.data} />
        </div>
      ) : null}

      {open && tutor.data ? (
        <ManageLesson
          type="book"
          tutorId={tutor.data.id}
          close={() => {
            setOpen(false);
            searchParams.delete("book");
            setSearchParams(searchParams);
          }}
        />
      ) : null}
    </div>
  );
};

export default TutorProfile;
