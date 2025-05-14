import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useEffect } from "react";
import { useUser } from "@litespace/headless/context/user";
import { redirect } from "react-router-dom";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import ProfileSettings from "@/components/TutorSettings/ProfileSettings";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { Web } from "@litespace/utils/routes";

const TutorSettings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, fetching, error, loading, refetch } = useUser();
  const { query: tutorInfo } = useFindTutorInfo(user?.id || null);

  useEffect(() => {
    if (!user && !loading && !error) redirect(Web.Login);
  }, [user, loading, error]);

  if (!user) return null;

  return (
    <div className="max-w-screen-3xl mx-auto w-full h-full p-4 lg:p-6">
      <div className="w-full h-full">
        <div className="mb-4 md:mb-10">
          <PageTitle
            title={intl("tutor-settings.profile.title")}
            fetching={fetching && !loading}
          />
        </div>

        {loading || tutorInfo.isPending ? (
          <div className="mt-[15vh]">
            <Loading
              size="large"
              text={intl("tutor-settings.profile.loading")}
            />
          </div>
        ) : null}

        {(error || tutorInfo.isError) && !loading && !tutorInfo.isPending ? (
          <div className="mt-[15vh]">
            <LoadingError
              size="large"
              retry={() => {
                refetch.user();
                refetch.meta();
                tutorInfo.refetch();
              }}
              error={intl("tutor-settings.profile.loading-error")}
            />
          </div>
        ) : null}

        {tutorInfo.data && !error && !loading ? (
          <ProfileSettings
            info={{
              ...tutorInfo.data,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default TutorSettings;
