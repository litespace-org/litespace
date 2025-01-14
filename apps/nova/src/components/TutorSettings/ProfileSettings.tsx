import { TutorProfileCard } from "@litespace/luna/TutorProfile";
import React from "react";
import { useFindTutorInfo } from "@litespace/headless/tutor";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { useFormatMessage } from "@litespace/luna/hooks/intl";

import { TutorSettingsTabs } from "@/components/TutorSettings/SettingsTabs";

export const ProfileSettings: React.FC<{
  id: number;
}> = ({ id }) => {
  const tutorInfo = useFindTutorInfo(id);
  const intl = useFormatMessage();
  if (!tutorInfo.data) return null;
  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between p-10 pb-0">
        <TutorProfileCard variant="small" {...tutorInfo.data} />
        <Button size={ButtonSize.Small}>{intl("settings.save")}</Button>
      </div>
      <TutorSettingsTabs />
    </div>
  );
};
