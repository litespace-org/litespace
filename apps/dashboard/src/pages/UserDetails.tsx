import Lessons from "@/components/Lessons/Content";
import BackLink from "@/components/Common/BackLink";
import StudentStats from "@/components/Students/Stats";
import TutorStats from "@/components/Tutor/Stats";
import InvoicesContent from "@/components/Invoices/Content";
import UserDetailsContent from "@/components/UserDetails/Content";
import { useParams } from "react-router-dom";
import { useFindUserById } from "@litespace/headless/users";
import { destructureRole } from "@litespace/utils/user";
import { useFindStudentStats } from "@litespace/headless/student";
import { useMemo, useCallback } from "react";
import { useFindTutorMeta, useFindTutorStats } from "@litespace/headless/tutor";
import { useFindInvoiceStats } from "@litespace/headless/invoices";

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

  const { query } = useFindUserById(id);

  const role = useMemo(() => {
    if (!query.data) return null;
    return destructureRole(query.data.role);
  }, [query.data]);

  const tutorQuery = useFindTutorMeta(role?.tutor && id ? id : undefined);

  const { query: teachingTutorStats } = useFindTutorStats(
    role?.tutor && id ? id : null
  );

  const { query: financialTutorStats } = useFindInvoiceStats(
    role?.tutor && id ? id : undefined
  );
  const studentStats = useFindStudentStats(role?.student ? id : undefined);
  const refetch = useCallback(() => {
    query.refetch();
    tutorQuery.refetch();
    teachingTutorStats.refetch();
    financialTutorStats.refetch();
  }, [query, tutorQuery, teachingTutorStats, financialTutorStats]);

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <BackLink to="/users" name="dashboard.users.title" />

      <UserDetailsContent
        user={query.data || undefined}
        tutor={tutorQuery.data || undefined}
        tutorStats={teachingTutorStats.data}
        loading={
          query.isLoading ||
          tutorQuery.isLoading ||
          teachingTutorStats.isLoading
        }
        error={query.error || tutorQuery.error || teachingTutorStats.error}
        refetch={refetch}
      />

      {role?.student ? (
        <div className="mt-4">
          <StudentStats stats={studentStats} />
        </div>
      ) : null}
      {role?.tutor ? (
        <div className="mt-4">
          <TutorStats stats={financialTutorStats} />
        </div>
      ) : null}

      {(role?.tutor || role?.tutorManager || role?.student) && id ? (
        <div className="mt-4">
          <Lessons user={id} />
        </div>
      ) : null}

      {role?.tutor ? (
        <InvoicesContent user={role?.tutor && id ? id : undefined} />
      ) : null}
    </div>
  );
};

export default UserDetails;
