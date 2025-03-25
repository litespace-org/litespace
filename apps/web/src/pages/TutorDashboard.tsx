import TutorOverview from "@/components/dashboard/TutorOverview";
import { PastLessons } from "@/components/dashboard/PastLessons";
import { UpcomingLessons } from "@/components/dashboard/UpcomingLessons";
import { ChatSummary } from "@/components/dashboard/ChatSummary";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";

const TutorDashboard: React.FC = () => {
  const { lg } = useMediaQuery();

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row p-4 lg:p-6 gap-4 lg:gap-6 max-w-screen-3xl mx-auto w-full"
      )}
    >
      {lg ? (
        <>
          <div className="flex flex-col gap-6 w-full">
            <TutorOverview />
            <PastLessons />
          </div>
          <div className="flex flex-col gap-6 w-[312px] shrink-0 justify-stretch">
            <UpcomingLessons />
            <ChatSummary />
          </div>
        </>
      ) : null}

      {!lg ? (
        <>
          <TutorOverview />
          <UpcomingLessons />
          <ChatSummary />
          <PastLessons />
        </>
      ) : null}
    </div>
  );
};

export default TutorDashboard;
