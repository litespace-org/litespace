import List from "@/components/Interviews/List";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
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
    <div>{interviews.data ? <List list={interviews.data.list} /> : null}</div>
  );
};

export default Interviews;
