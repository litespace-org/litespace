import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useEffect } from "react";
import { useUserContext } from "@litespace/headless/context/user";
import { ProfileForm } from "@/components/StudentSettings/ProfileForm";
import { redirect } from "react-router-dom";
import { Route } from "@/types/routes";
import { Loader, LoadingError } from "@litespace/ui/Loading";

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, fetching, error, loading, refetch } = useUserContext();

  useEffect(() => {
    if (!user && !!loading && !error) redirect(Route.Login);
  }, [user, loading, error]);

  return (
    <div className="p-4 md:p-6 mx-auto w-full md:max-w-screen">
      <div className="relative w-full">
        <PageTitle
          title={intl("settings.profile.title")}
          className="mb-4 md:mb-6"
          fetching={fetching && !loading}
        />

        <div>
          {loading ? (
            <div className="w-full mt-[12.5%] flex justify-center">
              <Loader size="large" text={intl("settings.loading")} />
            </div>
          ) : null}

          {error && !loading ? (
            <div className="w-full mt-[12.5%] flex justify-center">
              <LoadingError
                size="large"
                retry={refetch.user}
                error={intl("settings.error")}
              />
            </div>
          ) : null}

          {user && !error && !loading ? <ProfileForm user={user} /> : null}
        </div>
      </div>
    </div>
  );
};

export default Settings;
