import TutorOverview from "@/components/dashboard/TutorOverview";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { ChatSummary } from "@/components/dashboard/ChatSummary";

const TutorDashboard: React.FC = () => {
  return (
    <div className="flex flex-row p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      <div className="flex flex-col gap-6 w-full">
        <TutorOverview />
        <PastLessons />
      </div>
      <div className="flex flex-col gap-6 w-[312px] shrink-0 justify-stretch">
        <UpcomingLessons />
        <ChatSummary />
      </div>
    </div>
  );
};

export default TutorDashboard;
