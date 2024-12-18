import React from "react";
import { ChatSummaryWrapper } from "@/components/dashboard/ChatSummaryWrapper";
import { UpcomingLessonsSummaryWrapper } from "@/components/dashboard/UpcomingLessonsSummaryWrapper";
import { PastLessonsWrapper } from "@/components/dashboard/PastLessonsWrapper";
import { StudentOverviewWrapper } from "@/components/dashboard/StudentOverviewWrapper";
const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-[66%,33%] p-6 gap-6">
      <div className="flex flex-col gap-6">
        <StudentOverviewWrapper />
        <PastLessonsWrapper />
      </div>
      <div className="flex flex-col gap-6">
        <UpcomingLessonsSummaryWrapper />
        <ChatSummaryWrapper />
      </div>
    </div>
  );
};

export default Dashboard;
