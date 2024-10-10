import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors, setUserProfile } from "@/redux/user/profile";
import { findTutorMeta, tutorMetaSelectors } from "@/redux/user/tutor";
import { Route } from "@/types/routes";
import { RefreshUser, Settings, Spinner } from "@litespace/luna";
import { IUser } from "@litespace/types";
import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Complete: React.FC = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (profile.loading) return;
    const user = profile.value?.user;

    if (
      user === null ||
      [
        user?.email,
        user?.name,
        user?.password,
        user?.birthYear,
        user?.gender,
        user?.image,
      ].every((field) => field !== null && field !== undefined)
    )
      navigate(Route.Root);
  }, [navigate, profile.loading, profile.value]);

  return (
    <div className="max-w-screen-2xl mx-auto p-6">
      {profile.loading ? (
        <Spinner className="text-foreground-lighter" />
      ) : profile.value ? (
        <Settings.Profile
          fetching={profile.fetching || tutor.fetching}
          loading={profile.loading || tutor.loading}
          profile={profile.value.user || null}
          tutor={tutor.value}
          refresh={refresh}
          first
        />
      ) : null}
    </div>
  );
};

export default Complete;
