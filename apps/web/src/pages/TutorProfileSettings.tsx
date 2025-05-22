import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React from "react";
import { useUser } from "@litespace/headless/context/user";
import { Loading, LoadingError } from "@litespace/ui/Loading";
import Content from "@/components/TutorSettings/ProfileSettings";
import { useFindTutorInfo } from "@litespace/headless/tutor";

const TutorSettings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, refetch } = useUser();
  const { query: tutorInfo } = useFindTutorInfo(user?.id || null);

  if (!user) return null;

  return (
    <div className="max-w-screen-3xl mx-auto w-full h-full p-4 lg:p-6">
      <div className="w-full h-full">
        <div className="mb-4 md:mb-10">
          <PageTitle
            title={intl("tutor-settings.profile.title")}
            fetching={tutorInfo.isPending}
          />
        </div>

        {tutorInfo.isPending ? (
          <div className="mt-[15vh]">
            <Loading
              size="large"
              text={intl("tutor-settings.profile.loading")}
            />
          </div>
        ) : null}

        {tutorInfo.isError && !tutorInfo.isPending ? (
          <div className="mt-[15vh] w-full">
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

        {tutorInfo.data && !tutorInfo.isError && !tutorInfo.isPending ? (
          <Content
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
