import { ILesson, ISessionEvent } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LoadingFragment } from "@/components/Common/LoadingFragment";
import LessonSummary from "@/components/Lesson/LessonSummary";
import EventsTable from "@/components/Lesson/EventsTable";
import LessonEventsSummary from "@/components/Lesson/LessonEventsSummary";

interface ILessonData {
  lesson: {
    lesson: ILesson.Self;
    members: ILesson.PopulatedMember[];
  };
  events: {
    tutor: ISessionEvent.MetaSelf[];
    student: ISessionEvent.MetaSelf[];
  };
}

interface LessonProps {
  data: ILessonData | null;
  loading?: boolean;
  error?: Error | null;
  refetch: () => void;
}

const Lesson: React.FC<LessonProps> = ({
  data,
  loading = false,
  error = null,
  refetch,
}) => {
  const intl = useFormatMessage();

  // Loading and error states
  if (loading || error) {
    return (
      <LoadingFragment
        loading={
          loading
            ? {
                text: intl("dashboard.lesson.loading"),
                size: "large",
              }
            : undefined
        }
        error={
          error
            ? {
                text: intl("dashboard.lesson.error"),
                size: "medium",
              }
            : undefined
        }
        refetch={refetch}
      />
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{intl("dashboard.lesson.no-data")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-4 py-6">
      <LessonSummary lesson={data.lesson} />
      <LessonEventsSummary lesson={data.lesson} events={data.events} />
      <div className="space-y-8">
        <EventsTable
          title={intl("dashboard.lesson.tutor")}
          events={data.events.tutor}
        />
        <EventsTable
          title={intl("dashboard.lesson.student")}
          events={data.events.student}
        />
      </div>
    </div>
  );
};

export default Lesson;
