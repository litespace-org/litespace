import PageContent from "@/components/Common/PageContent";
import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useEffect } from "react";
import { useUserContext } from "@litespace/headless/context/user";
import { redirect } from "react-router-dom";
import { Route } from "@/types/routes";
import { Loader, LoadingError } from "@litespace/luna/Loading";
import { ProfileSettings } from "@/components/TutorSettings/ProfileSettings";
import { useFindTutorInfo } from "@litespace/headless/tutor";

const TutorSettings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, fetching, error, loading, refetch } = useUserContext();
  const tutorInfo = useFindTutorInfo(user?.id || null);

  useEffect(() => {
    if (!user && !!loading && !error) redirect(Route.Login);
  }, [user, loading, error]);

  return (
    <div className="max-w-screen-3xl mx-auto w-full p-6">
      <div className="w-full">
        <div className="mb-8">
          <PageTitle
            title={intl("tutor-settings.profile.title")}
            fetching={fetching && !loading}
          />
        </div>

        {loading ? (
          <div className="w-full h-[908px] pt-[149px] flex justify-center">
            <div className="h-[181px]">
              <Loader
                size="large"
                text={intl("tutor-settings.profile.loading")}
              />
            </div>
          </div>
        ) : null}
        {error && !loading ? (
          <div className="w-full h-[908px] pt-[149px] flex justify-center">
            <div className="h-[181px]">
              <LoadingError
                size="large"
                retry={refetch.user}
                error={intl("tutor-settings.profile.loading-error")}
              />
            </div>
          </div>
        ) : null}
        <PageContent>
          {tutorInfo.data && !error && !loading ? (
            <ProfileSettings {...tutorInfo.data} />
          ) : null}
        </PageContent>
      </div>
    </div>
  );
};

export default TutorSettings;
