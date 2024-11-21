import PageTitle from "@/components/Common/PageTitle";
import PageContent from "@/components/Common/PageContent";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useState } from "react";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { orNull } from "@litespace/sol/utils";
import { Button, ButtonSize } from "@litespace/luna/Button";

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.full);
  const [photo, setPhoto] = useState<File | null>(null);

  return (
    <div className="max-w-screen-lg mx-auto w-full">
      <div className="w-full">
        <div className="mb-8">
          <PageTitle
            title={intl("settings.profile.title")}
            fetching={profile.fetching && !profile.loading}
          />
        </div>

        <PageContent className="p-14">
          <UploadPhoto
            setPhoto={setPhoto}
            photo={photo || orNull(profile.value?.user.image)}
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
