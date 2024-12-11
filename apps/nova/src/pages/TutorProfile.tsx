import { Loading } from "@litespace/luna/Loading";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import RightArrowHead from "@litespace/assets/RightArrowHead";
import { Typography } from "@litespace/luna/Typography";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { TutorProfileCard } from "@litespace/luna/TutorProfile";
import { TutorTabs } from "@/components/TutorProfile/TutorTabs";

const TutorProfile: React.FC = () => {
  const params = useParams<{ id: string }>();
  const intl = useFormatMessage();

  const id = useMemo(() => {
    const id = Number(params.id);
    if (Number.isNaN(id)) return null;
    return id;
  }, [params.id]);

  const tutor = useFindTutorInfo(id);

  if (tutor.isLoading) return <Loading className="h-[40vh]" />;

  //TODO: Need to implement error state
  if (!tutor.data || tutor.error) return null;
  return (
    <div className="w-full max-w-screen-3xl p-6 mx-auto mb-12 lg:max-w-screen-2xl">
      <div className="flex items-center gap-6">
        <button className="w-6 h-6 flex items-center justify-center">
          <RightArrowHead className="[&>*]:stroke-brand-700" />
        </button>
        <Typography element="subtitle-2" className="font-bold text-natural-950">
          {intl("tutors.title")} /{" "}
          <span className="underline text-brand-700">{tutor.data.name}</span>
        </Typography>
      </div>
      <div className="bg-natural-50 border border-natural-100 shadow-tutor-profile rounded-2xl p-10 mt-6">
        <TutorProfileCard {...tutor.data} />
        <TutorTabs tutor={tutor.data} />
      </div>
    </div>
  );
};

export default TutorProfile;
