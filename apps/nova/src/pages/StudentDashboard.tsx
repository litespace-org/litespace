import React from "react";
import { ChatSummary } from "@/components/dashboard/ChatSummary";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { StudentOverview } from "@/components/dashboard/StudentOverview";

const StudentDashboard: React.FC = () => {
  return (
    <div className="flex flex-row p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      <div className="flex flex-col gap-6 w-full">
        <StudentOverview />
        <PastLessons />
      </div>
      <div className="flex flex-col gap-6 w-[312px] shrink-0">
        <UpcomingLessons />
        <ChatSummary />
      </div>
    </div>
  );
};

export default StudentDashboard;
