import CompleteInfo from "@/components/CompleteInfo";
import { useAppSelector } from "@/redux/store";
import { Route } from "@/types/routes";
import { Spinner } from "@litespace/luna";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Complete: React.FC = () => {
  const profile = useAppSelector((state) => state.user.me);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile.loading) return;
    const user = profile.value;
    if (
      [
        user?.email,
        user?.name,
        user?.password,
        user?.birthYear,
        user?.gender,
        user?.photo,
      ].every((field) => field !== null && field !== undefined)
    )
      navigate(Route.Root);
  }, [navigate, profile.loading, profile.value]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {profile.loading ? (
        <Spinner className="text-foreground-lighter" />
      ) : profile.value ? (
        <CompleteInfo profile={profile.value} />
      ) : null}
    </div>
  );
};

export default Complete;
