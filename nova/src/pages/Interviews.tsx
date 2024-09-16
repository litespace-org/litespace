import List from "@/components/Interviews/List";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { Spinner } from "@litespace/luna";
import React, { useCallback } from "react";
import { useQuery } from "react-query";

const Interviews: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const findInterviews = useCallback(async () => {
    if (!profile) return null;
    return atlas.interview.findInterviews(profile.id);
  }, [profile]);

  const interviews = useQuery({
    queryFn: findInterviews,
    queryKey: "find-user-interviews",
    enabled: !!profile,
  });

  return (
    <div className="max-w-screen-2xl mx-auto w-full px-6 py-10">
      {interviews.isLoading ? (
        <div className="flex items-center justify-center mt-32">
          <Spinner />
        </div>
      ) : null}

      {interviews.data && profile ? (
        <List list={interviews.data.list} user={profile} />
      ) : null}
    </div>
  );
};

export default Interviews;
