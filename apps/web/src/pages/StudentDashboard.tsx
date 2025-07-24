import { ChatSummary } from "@/components/dashboard/ChatSummary";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { StudentOverview } from "@/components/dashboard/StudentOverview";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { useOnError } from "@/hooks/error";
import { router } from "@/lib/routes";
import EmptyStudentDashboard from "@litespace/assets/EmptyStudentDashboard";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { useFindPersonalizedStudentStats } from "@litespace/headless/student";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Web } from "@litespace/utils/routes";
import React from "react";
import { Link } from "react-router-dom";

const StudentDashboard: React.FC = () => {
  const mq = useMediaQuery();

  const { query, keys } = useFindPersonalizedStudentStats();

  useOnError({
    type: "query",
    error: query.error,
    keys,
  });

  if (query.data?.completedLessonCount === 0) return <EmptyDashboard />;

  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      {mq.lg ? (
        <>
          <div className="flex flex-col gap-6 w-full">
            <StudentOverview
              completedLessonCount={query.data?.completedLessonCount || 0}
              totalLearningTime={query.data?.completedLessonCount || 0}
              tutorCount={query.data?.tutorCount || 0}
              isError={query.isError}
              isPending={query.isLoading}
              refetch={query.refetch}
            />
            <PastLessons />
          </div>
          <div className="flex flex-col gap-6 lg:w-[312px] shrink-0">
            <UpcomingLessons />
            <ChatSummary />
          </div>
        </>
      ) : null}

      {!mq.lg ? (
        <div className="flex flex-col gap-4 w-full">
          <StudentOverview
            completedLessonCount={query.data?.completedLessonCount || 0}
            totalLearningTime={query.data?.completedLessonCount || 0}
            tutorCount={query.data?.tutorCount || 0}
            isError={query.isError}
            isPending={query.isLoading}
            refetch={query.refetch}
          />
          <UpcomingLessons />
          <PastLessons />
          <ChatSummary />
        </div>
      ) : null}
    </div>
  );
};

const EmptyDashboard: React.FC = () => {
  const intl = useFormatMessage();

  return (
    <div className="mt-[20vh] flex flex-col gap-6 mx-auto">
      <EmptyStudentDashboard className="w-[328px] h-[258px] md:w-[433px] md:h-[342px]" />
      <div className="flex flex-col gap-4 text-center w-max mx-auto">
        <Typography tag="p" className="text-subtitle-2 font-medium">
          {intl("student-dashboard.empty-state.desc")}
        </Typography>
        <Link to={router.web({ route: Web.Tutors, full: true })} tabIndex={-1}>
          <Button className="w-full" size="large">
            {intl("student-dashboard.empty-state.btn")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
