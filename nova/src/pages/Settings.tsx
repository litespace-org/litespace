import React from "react";
import { Settings as Components } from "@litespace/luna";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { tutorMetaSelector } from "@/redux/user/tutor";

const Settings: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const tutor = useAppSelector(tutorMetaSelector);

  return (
    <div className="p-6">
      {profile ? <Components.Profile profile={profile} tutor={tutor} /> : null}
    </div>
  );
};

export default Settings;
