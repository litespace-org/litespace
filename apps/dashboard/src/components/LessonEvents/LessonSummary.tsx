import { ILesson } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import dayjs from "@/lib/dayjs";
import DateTimeField from "@/components/Common/DateTimeField";
import { Duration, price } from "@litespace/utils";
import { formatCurrency } from "@litespace/ui/utils";
import UserPopover from "@/components/Common/UserPopover";
import LabelsTable from "@/components/Common/LabelsTable";

interface LessonSummaryProps {
  lesson: {
    lesson: ILesson.Self;
    members: ILesson.PopulatedMember[];
  };
}

const LessonSummary: React.FC<LessonSummaryProps> = ({ lesson }) => {
  const intl = useFormatMessage();
  const { lesson: lessonDetails, members } = lesson;
  const start = dayjs(lessonDetails.start);
  const end = start.add(lessonDetails.duration, "minutes");

  return (
    <div className="mb-8 px-4 min-w-full">
      <h2 className="text-xl font-bold mb-4">
        {intl("dashboard.lesson-events.lesson-summary")}
      </h2>

      <LabelsTable
        rows={[
          { label: intl("labels.id"), value: lessonDetails.id },
          {
            label: intl("dashboard.lessons.start"),
            value: <DateTimeField date={lessonDetails.start} />,
          },
          {
            label: intl("dashboard.lessons.end"),
            value: <DateTimeField date={end.toISOString()} />,
          },
          {
            label: intl("dashboard.lessons.duration"),
            value: Duration.from(lessonDetails.duration.toString()).format(
              "ar"
            ),
          },
          {
            label: intl("dashboard.lessons.price"),
            value: formatCurrency(price.unscale(lessonDetails.price)),
          },
          {
            label: intl("dashboard.lessons.members"),
            value: members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-center gap-2"
              >
                <UserPopover id={member.userId} />
              </div>
            )),
          },
          {
            label: intl("dashboard.lesson-events.status"),
            value: lessonDetails.canceledAt ? (
              <span className="text-red-600">
                {intl("dashboard.lesson-events.cancelled")}
              </span>
            ) : dayjs().isBefore(start) ? (
              <span className="text-yellow-600">
                {intl("dashboard.lesson-events.scheduled")}
              </span>
            ) : dayjs().isBetween(start, end) ? (
              <span className="text-green-600">
                {intl("dashboard.lesson-events.ongoing")}
              </span>
            ) : (
              <span className="text-gray-600">
                {intl("dashboard.lesson-events.completed")}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default LessonSummary;
