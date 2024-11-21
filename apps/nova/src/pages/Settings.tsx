import PageTitle from "@/components/Common/PageTitle";
import PageContent from "@/components/Common/PageContent";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import React, { useState } from "react";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { orNull } from "@litespace/sol/utils";
import { Button, ButtonSize } from "@litespace/luna/Button";
import Personal from "@/components/Settings/Personal";

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

        <PageContent className="flex flex-col gap-8 p-14">
          <UploadPhoto
            setPhoto={setPhoto}
            photo={photo || orNull(profile.value?.user.image)}
          />
          <Personal user={profile.value?.user}>
            <Button
              disabled={photo === null}
              size={ButtonSize.Large}
              className="mr-auto"
              htmlType="submit"
            >
              {intl("settings.save")}
            </Button>
          </Personal>
        </PageContent>
      </div>
    </div>
  );
};

export default Settings;
