import React, { useMemo, useState } from "react";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import dayjs from "@/lib/dayjs";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { AvailabilitySlotProps, Calendar } from "@litespace/ui/Calendar";
import ChevronRight from "@litespace/assets/ChevronRight";
import { Typography } from "@litespace/ui/Typography";
import ChevronLeft from "@litespace/assets/ChevronLeft";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

const TutorCalendar: React.FC<{ tutorId: number }> = ({ tutorId }) => {
  const intl = useFormatMessage();
  const [start, setStart] = useState(dayjs().startOf("week"));
  const end = useMemo(() => start.add(1, "week"), [start]);

  const slotsQuery = useFindAvailabilitySlots({
    userIds: [tutorId],
    after: start.toISOString(),
    before: end.toISOString(),
    full: true,
  });

  const lessonsQuery = useInfiniteLessons({
    users: tutorId ? [tutorId] : [],
    userOnly: true,
    after: start.toISOString(),
    before: end.toISOString(),
    full: true,
  });

  const slots = useMemo(() => {
    const calendarSlots: AvailabilitySlotProps[] = [];
    if (!slotsQuery.data) return calendarSlots;

    for (const slot of slotsQuery.data.slots.list) {
      const withinLessons =
        lessonsQuery.list?.filter((obj) => {
          const start = dayjs(obj.lesson.start);
          return (
            start.isBetween(slot.start, slot.end) || start.isSame(slot.start)
          );
        }) || [];

      const members: AvailabilitySlotProps["members"] = [];
      withinLessons.forEach((obj) => {
        obj.members.forEach((member) => {
          if (member.userId !== tutorId)
            members.push({
              id: member.userId,
              image: member.image,
              name: member.name,
            });
        });
      });

      calendarSlots.push({
        id: slot.id,
        start: slot.start,
        end: slot.end,
        members,
      });
    }

    return calendarSlots;
  }, [slotsQuery.data, lessonsQuery.list, tutorId]);

  return (
    <div>
      <Typography
        tag="h4"
        className="text-subtitle-2 font-bold text-natural-950 mb-3"
      >
        {intl("dashboard.labels.tutor-schedule")}
      </Typography>
      <div className="mb-4">
        <div className="flex flex-row gap-4 items-center justify-between md:justify-center">
          <button
            onClick={() => setStart(start.subtract(1, "week"))}
            type="button"
          >
            <ChevronRight className="[&>*]:stroke-natural-700 w-6 h-6" />
          </button>

          <Typography
            tag="span"
            className="text-natural-950 text-caption lg:text-body font-bold"
          >
            {start.format("DD MMMM")}
            {" - "}
            {end.subtract(1, "day").format("DD MMMM")}
          </Typography>

          <button onClick={() => setStart(start.add(1, "week"))} type="button">
            <ChevronLeft className="w-6 h-6 [&>*]:stroke-natural-700" />
          </button>
        </div>
      </div>

      <Calendar
        date={start}
        slots={slots}
        loading={slotsQuery.isPending || lessonsQuery.query.isPending}
        error={slotsQuery.isError}
        retry={() => {
          slotsQuery.refetch();
          lessonsQuery.query.refetch();
        }}
      />
    </div>
  );
};

export default TutorCalendar;
