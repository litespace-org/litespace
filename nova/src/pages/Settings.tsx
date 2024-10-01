import React, { useCallback } from "react";
import { Settings as Components } from "@litespace/luna";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findProfile, profileSelectors, setUserProfile } from "@/redux/user/me";
import { findTutorMeta, tutorMetaSelector } from "@/redux/user/tutor";
import { RefreshUser } from "@litespace/luna";
import { IUser } from "@litespace/types";

const Settings: React.FC = () => {
  const profile = useAppSelector(profileSelectors.full);
  const tutor = useAppSelector(tutorMetaSelector);
  const dispatch = useAppDispatch();

  const refresh: RefreshUser = useCallback(
    (user?: IUser.Self) => {
      if (user) dispatch(setUserProfile(user));
      else dispatch(findProfile.call(null));

      if (user?.role === IUser.Role.Tutor)
        dispatch(findTutorMeta.call(user.id));
    },
    [dispatch]
  );

  return (
    <div className="p-6">
      <Components.Profile
        profile={profile.value}
        refresh={refresh}
        tutor={tutor}
        loading={profile.loading}
        fetching={profile.fetching}
      />
    </div>
  );
};

export default Settings;
