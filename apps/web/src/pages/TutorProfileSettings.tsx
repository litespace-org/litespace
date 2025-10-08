import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";
import { useUser } from "@litespace/headless/context/user";
import Content from "@/components/TutorProfileSettings/Content";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { useOnError } from "@/hooks/error";
import { ITutor, Void } from "@litespace/types";
import { Loading, LoadingError } from "@litespace/ui/Loading";

const TutorSettings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, fetching } = useUser();
  const query = useFindTutorInfo(user?.id);

  useOnError({
    type: "query",
    error: query.error,
    keys: query.keys,
  });

  return (
    <div className="max-w-screen-3xl mx-auto w-full h-full p-4 lg:p-6">
      <div className="w-full h-full">
        <div className="mb-4 md:mb-10">
          <PageTitle
            title={intl("tutor-settings.profile.title")}
            fetching={fetching}
          />
        </div>

        <Body
          data={query.data}
          error={query.isError}
          refetch={query.refetch}
          loading={query.isLoading}
        />
      </div>
    </div>
  );
};

const Body: React.FC<{
  data?: ITutor.FindTutorInfoApiResponse | null;
  loading: boolean;
  error: boolean;
  refetch: Void;
}> = ({ data, loading, error, refetch }) => {
  const intl = useFormatMessage();

  if (loading)
    return (
      <div className="mt-[10vh]">
        <Loading size="large" />
      </div>
    );

  if (error || !data)
    return (
      <div className="w-fit mx-auto">
        <LoadingError
          error={intl("tutor-settings.profile.loading-error")}
          retry={refetch}
          size="small"
        />
      </div>
    );

  return (
    <Content
      id={data.id}
      bio={data.bio}
      name={data.name}
      about={data.about}
      image={data.image}
      studentCount={data.studentCount}
      avgRating={data.avgRating}
      lessonCount={data.lessonCount}
    />
  );
};

export default TutorSettings;
