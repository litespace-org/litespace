import PageContent from "@/components/Common/PageContent";
import PageTitle from "@/components/Common/PageTitle";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React from "react";
import { useUser } from "@litespace/headless/context/user";
import { ProfileForm } from "@/components/Settings/ProfileForm";
import { redirect } from "react-router-dom";
import { Route } from "@/types/routes";

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, loading, fetching } = useUser();

  if (!user) {
    redirect(Route.Login);
    return null;
  }

  return (
    <div className="max-w-screen-3xl mx-auto w-full p-6">
      <div className="w-full">
        <div className="mb-8">
          <PageTitle
            title={intl("settings.profile.title")}
            fetching={fetching && !loading}
          />
        </div>

        <PageContent>
          <ProfileForm user={user} />
        </PageContent>
      </div>
    </div>
  );
};

export default Settings;
