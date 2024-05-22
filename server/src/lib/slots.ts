import { Dayjs } from "dayjs";
import zod from "zod";
import dayjs from "@/lib/dayjs";
import { Slot } from "@/database";

type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

export function asTimeValues(input: string): Time {
  const time = zod
    .string()
    .time({ message: `"${input}" is not a valid time` })
    .parse(input);

  const [hours, minutes, seconds] = time.split(":");

  return {
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
  };
}

function selectSlots(slots: Slot.Self[], date: Dayjs) {
  return slots.filter((slot) => {
    const noRepeat = slot.repeat === Slot.Repeat.NoRepeat;
    if (noRepeat) return dayjs(slot.date.start).isSame(date);

    // Handle daily slots (bounded & unbounded)
    const daily = slot.repeat === Slot.Repeat.Daily;
    const bounded = !!slot.date.end;
    const dailySlotStarted = dayjs(slot.date.start).isBefore(
      date.add(1, "second")
    );
    const daillySlotEneded = dayjs(slot.date.end).isBefore(date);
    if (daily && bounded) return dailySlotStarted && !daillySlotEneded;
    if (daily && !bounded) return dailySlotStarted;
  });
}

export function setDayTime(date: Dayjs, time: Time): Dayjs {
  return date
    .set("hours", time.hours)
    .set("minutes", time.minutes)
    .set("seconds", time.seconds)
    .set("milliseconds", 0);
}

export function unpackSlots(slots: Slot.Self[]) {
  const today = setDayTime(dayjs().utc(), { hours: 0, minutes: 0, seconds: 0 });

  for (let dayIndex = 0; dayIndex < 14; dayIndex++) {
    const slot = slots[0];
    const start = asTimeValues(slot.time.start);
    const end = asTimeValues(slot.time.end);
    const day = today.add(dayIndex, "day");
    const exactStartTime = setDayTime(day, start);
    const exactEndTime = setDayTime(day, end);

    const selected = selectSlots(slots, day);

    console.log(
      JSON.stringify(
        {
          day: day.toISOString(),
          selected,
        },
        null,
        2
      )
    );
  }
}
