import React, { useState } from "react";
import { ChatSummary } from "@/components/dashboard/ChatSummary";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { StudentOverview } from "@/components/dashboard/StudentOverview";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import EmptyStudentDashboard from "@litespace/assets/EmptyStudentDashboard";
import { Typography } from "@litespace/ui/Typography";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { Link } from "react-router-dom";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

const StudentDashboard: React.FC = () => {
  const mq = useMediaQuery();
  const intl = useFormatMessage();
  const [isEmptyLessons, setIsEmptyLessons] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      {isEmptyLessons ? (
        <div className="mt-[20vh] flex flex-col gap-6 mx-auto">
          <EmptyStudentDashboard />
          <div className="flex flex-col gap-4 text-center w-max mx-auto">
            <Typography tag="p" className="text-subtitle-2 font-medium">
              {intl("student-dashboard.empty-state.desc")}
            </Typography>
            <Link
              to={router.web({ route: Web.Tutors, full: true })}
              tabIndex={-1}
            >
              <Button className="w-full" size="large">
                {intl("student-dashboard.empty-state.btn")}
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {mq.lg && !isEmptyLessons ? (
        <>
          <div className="flex flex-col gap-6 w-full">
            <StudentOverview
              setIsEmptyLessons={() => setIsEmptyLessons(true)}
            />
            <PastLessons />
          </div>
          <div className="flex flex-col gap-6 lg:w-[312px] shrink-0">
            <UpcomingLessons />
            <ChatSummary />
          </div>
        </>
      ) : null}

      {!mq.lg && !isEmptyLessons ? (
        <div className="flex flex-col gap-4 w-full">
          <StudentOverview setIsEmptyLessons={() => setIsEmptyLessons(true)} />
          <UpcomingLessons />
          <PastLessons />
          <ChatSummary />
        </div>
      ) : null}
    </div>
  );
};

export default StudentDashboard;
