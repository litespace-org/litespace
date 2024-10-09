import React, { useCallback } from "react";
import { Settings as Components } from "@litespace/luna";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors, setUserProfile } from "@/redux/user/profile";
import { findTutorMeta, tutorMetaSelectors } from "@/redux/user/tutor";
import { RefreshUser } from "@litespace/luna";
import { IUser } from "@litespace/types";

const Settings: React.FC = () => {
  const profile = useAppSelector(profileSelectors.full);
  const tutor = useAppSelector(tutorMetaSelectors.full);
  const dispatch = useAppDispatch();

  const refresh: RefreshUser = useCallback(
    (user?: IUser.Self) => {
      if (user) dispatch(setUserProfile({ user }));

      if (user?.role === IUser.Role.Tutor)
        dispatch(findTutorMeta.call(user.id));
    },
    [dispatch]
  );

  return (
    <div className="p-6 max-w-screen-2xl mx-auto w-full sm:w-fit pb-32">
      <Components.Profile
        profile={profile.value?.user || null}
        refresh={refresh}
        tutor={tutor.value}
        loading={profile.loading}
        fetching={profile.fetching}
      />

      {tutor.value ? (
        <Components.Notice
          notice={tutor.value.notice}
          fetching={tutor.fetching}
          user={tutor.value.id}
          refresh={refresh}
        />
      ) : null}
    </div>
  );
};

export default Settings;
