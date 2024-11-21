import PageTitle from "@/components/Common/PageTitle";
import PageContent from "@/components/Common/PageContent";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useState } from "react";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { orNull } from "@litespace/sol/utils";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useUser } from "@litespace/headless/user-ctx";

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const { user, fetching, loading } = useUser();
  const [photo, setPhoto] = useState<File | null>(null);

  return (
    <div className="max-w-screen-lg mx-auto w-full">
      <div className="w-full">
        <div className="mb-8">
          <PageTitle
            title={intl("settings.profile.title")}
            fetching={fetching && !loading}
          />
        </div>

        <PageContent className="p-14">
          <UploadPhoto
            setPhoto={setPhoto}
            photo={photo || orNull(user?.image)}
          />
          <div className="w-full">
            <Button
              disabled={photo === null}
              size={ButtonSize.Large}
              className="mr-auto"
            >
              {intl("settings.save")}
            </Button>
          </div>
        </PageContent>
      </div>
    </div>
  );
};

export default Settings;
