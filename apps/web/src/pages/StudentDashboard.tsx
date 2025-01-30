import React from "react";
import { ChatSummary } from "@/components/dashboard/ChatSummary";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { StudentOverview } from "@/components/dashboard/StudentOverview";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const StudentDashboard: React.FC = () => {
  const mq = useMediaQuery();
  return (
    <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      {mq.lg ? (
        <>
          <div className="flex flex-col gap-6 w-full">
            <StudentOverview />
            <PastLessons />
          </div>
          <div className="flex flex-col gap-6 lg:w-[312px] shrink-0">
            <UpcomingLessons />
            <ChatSummary />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <StudentOverview />
          <UpcomingLessons />
          <PastLessons />
          <ChatSummary />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
