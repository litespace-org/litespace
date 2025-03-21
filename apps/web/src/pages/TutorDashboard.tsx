import TutorOverview from "@/components/dashboard/TutorOverview";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { ChatSummary } from "@/components/dashboard/ChatSummary";
import { useMediaQuery } from "@litespace/headless/mediaQuery";

const TutorDashboard: React.FC = () => {
  const mq = useMediaQuery();
  return (
    <div className="flex flex-row p-6 gap-6 max-w-screen-3xl mx-auto w-full">
      {mq.lg ? (
        <>
          <div className="flex flex-col gap-6 w-full">
            <TutorOverview />
            <PastLessons />
          </div>
          <div className="flex flex-col gap-6 lg:w-[312px] shrink-0">
            <UpcomingLessons />
            <ChatSummary />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 w-full">
          <TutorOverview />
          <UpcomingLessons />
          <PastLessons />
          <ChatSummary />
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
