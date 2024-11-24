import React, { useMemo, useState } from "react";
import { Calendar } from "@litespace/luna/Calendar/v2";
import dayjs from "@/lib/dayjs";
import { useFindLessons } from "@litespace/headless/lessons";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";

const Schedule: React.FC = () => {
  const [date, setDate] = useState(dayjs().startOf("week"));
  const user = useAppSelector(profileSelectors.user);

  const lessons = useFindLessons(
    useMemo(
      () => ({
        users: user ? [user.id] : [],
        userOnly: true,
        size: 1,
        // todo: filter lessons by date
      }),
      [user]
    )
  );

  console.log(lessons.query.data);

  return (
    <div className="w-full p-6 mx-auto overflow-hidden max-w-screen-lg">
      <Calendar
        date={date}
        nextWeek={() => {
          setDate((prev) => prev.add(1, "week"));
        }}
        prevWeek={() => {
          setDate((prev) => prev.subtract(1, "week"));
        }}
      />
    </div>
  );
};

export default Schedule;
