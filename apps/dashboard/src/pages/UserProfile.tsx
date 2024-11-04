import { useFindUserById } from "@litespace/headless/users";
import { useParams } from "react-router-dom";
import { IUser } from "@litespace/types";
import { UseQueryResult } from "@tanstack/react-query";
import Content from "@/components/UserProfile/Content";
import { useMemo } from "react";
import BackLink from "@/components/common/BackLink";
import { useFindTutorMeta } from "@litespace/headless/user";

type UserProfileParams = {
  id: string;
};

const UserProfile = () => {
  const params = useParams<UserProfileParams>();

  const id = useMemo(() => {
    const id = params.id;
    if (!id) throw new Error("Missing user id param");
    const value = Number(id);
    if (Number.isNaN(value)) throw new Error(`"${id}" is not a valid user id`);
    return value;
  }, [params.id]);

  const query: UseQueryResult<IUser.Self> = useFindUserById(id);
  const tutorQuery = useFindTutorMeta(id);

  return (
    <div className="max-w-screen-lg mx-auto w-full p-6">
      <BackLink to="/users" name="dashboard.users.title" />

      <Content
        user={query.data}
        tutor={tutorQuery.data}
        loading={query.isLoading}
        error={query.error}
        refetch={query.refetch}
      />
    </div>
  );
};

export default UserProfile;
