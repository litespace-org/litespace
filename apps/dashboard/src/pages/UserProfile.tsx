import BackLink from "@/components/common/BackLink";
import Content from "@/components/UserProfile/Content";
import UserInterviews from "@/components/UserProfile/UserInterviews";
import { useFindTutorMeta } from "@litespace/headless/tutor";
import { useFindUserById } from "@litespace/headless/users";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { IUser } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";

type UserProfileParams = {
  id: string;
};

const UserProfile = () => {
  const intl = useFormatMessage();
  const params = useParams<UserProfileParams>();

  const id = useMemo(() => {
    const id = params.id;
    if (!id) throw new Error("Missing user id param");
    const value = Number(id);
    if (Number.isNaN(value)) throw new Error(`"${id}" is not a valid user id`);
    return value;
  }, [params.id]);

  const query: UseQueryResult<IUser.Self> = useFindUserById(id);

  const tutorId = useMemo(() => {
    const isTutor = query.data?.role === IUser.Role.Tutor;
    if (!isTutor || !query.data) return;
    return query.data.id;
  }, [query.data]);

  const interviewsId = useMemo(() => {
    if (query.data?.role === IUser.Role.Tutor || IUser.Role.Interviewer)
      return query.data?.id;
  }, [query.data]);

  const tutorQuery = useFindTutorMeta(tutorId);

  const refetch = useCallback(() => {
    query.refetch();
    tutorQuery.refetch();
  }, [query, tutorQuery]);

  return (
    <div className="max-w-screen-lg mx-auto w-full p-6">
      <BackLink to="/users" name="dashboard.users.title" />

      <Content
        user={query.data}
        tutor={tutorQuery.data}
        loading={query.isLoading || tutorQuery.isLoading}
        error={query.error || tutorQuery.error}
        refetch={refetch}
      />
      {interviewsId ? (
        <UserInterviews
          id={interviewsId}
          name={query.data?.name || intl("global.labels.user")}
        />
      ) : null}
    </div>
  );
};

export default UserProfile;
