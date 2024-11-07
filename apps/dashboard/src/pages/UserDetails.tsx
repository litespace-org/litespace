import BackLink from "@/components/common/BackLink";
import Content from "@/components/UserDetails/Content";
import Interviews from "@/components/Interviews/Content";
import Lessons from "@/components/Lessons/Content";
import UserStats from "@/components/UserDetails/UserStats";
import { useFindTutorMeta } from "@litespace/headless/tutor";
import { useFindUserById } from "@litespace/headless/users";
import { destructureRole } from "@litespace/sol/user";
import { IUser } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

type UserProfileParams = {
  id: string;
};

const UserDetails = () => {
  const params = useParams<UserProfileParams>();

  const id = useMemo(() => {
    const id = params.id;
    if (!id) throw new Error("Missing user id param");
    const value = Number(id);
    if (Number.isNaN(value)) throw new Error(`"${id}" is not a valid user id`);
    return value;
  }, [params.id]);

  const query: UseQueryResult<IUser.Self> = useFindUserById(id);

  const role = useMemo(() => {
    if (!query.data) return null;
    return destructureRole(query.data.role);
  }, [query.data]);

  const tutorQuery = useFindTutorMeta(role?.tutor && id ? id : undefined);

  const refetch = useCallback(() => {
    query.refetch();
    tutorQuery.refetch();
  }, [query, tutorQuery]);

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <BackLink to="/users" name="dashboard.users.title" />

      <Content
        user={query.data}
        tutor={tutorQuery.data}
        loading={query.isLoading || tutorQuery.isLoading}
        error={query.error || tutorQuery.error}
        refetch={refetch}
      />

      {(role?.tutor || role?.interviewer) && id ? (
        <div className="mt-4">
          <Interviews user={id} />
        </div>
      ) : null}

      {(role?.tutor || role?.interviewer || role?.student) && id ? (
        <div className="mt-4">
          <Lessons user={id} />
        </div>
      ) : null}

      {role?.tutor && id && <UserStats id={id} />}
    </div>
  );
};

export default UserDetails;
