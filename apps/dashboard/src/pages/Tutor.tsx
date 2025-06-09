import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useFindAvailabilitySlots } from "@litespace/headless/availabilitySlots";
import dayjs from "@/lib/dayjs";
import { useInfiniteLessons } from "@litespace/headless/lessons";
import { AvailabilitySlotProps, Calendar } from "@litespace/ui/Calendar";
import ArrowRight from "@litespace/assets/ArrowRight";
import { Typography } from "@litespace/ui/Typography";
import ArrowLeft from "@litespace/assets/ArrowLeft";

const Tutor: React.FC = () => {
  const [start, setStart] = useState(dayjs().startOf("week"));
  const end = useMemo(() => start.add(1, "week"), [start]);

  const params = useParams<{ id: string }>();
  const tutorId = useMemo(() => {
    const id = params.id;
    if (!id || isNaN(Number(id))) return null;
    return Number(id);
  }, [params.id]);

  const slotsQuery = useFindAvailabilitySlots({
    userId: tutorId || 0,
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
    <div className="max-w-screen-3xl mx-auto w-full p-6">
      <div className="mb-4">
        <div className="flex flex-row gap-4 items-center justify-between md:justify-center">
          <button
            onClick={() => setStart(start.subtract(1, "week"))}
            type="button"
          >
            <ArrowRight className="[&>*]:stroke-brand-700 w-6 h-6" />
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
            <ArrowLeft className="w-6 h-6 [&>*]:stroke-brand-700" />
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

export default Tutor;
