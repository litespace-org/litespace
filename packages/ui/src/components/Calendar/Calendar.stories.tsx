import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar/Calendar";
import React from "react";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { faker } from "@faker-js/faker/locale/en";
import {
  AvailabilitySlotProps,
  LessonProps,
  SlotActions,
  LessonActions,
} from "@/components/Calendar/types";
import { random, range, sample } from "lodash";

type Component = typeof Calendar;

const meta: Meta<Component> = {
  title: "Calendar",
  component: Calendar,
  decorators: [
    (Story) => (
      <div className="tw-p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: null,
  },
};

const slotActions: SlotActions = {
  onDelete(id) {
    alert(`Delete ${id}`);
  },
  onEdit(id) {
    alert(`Edit ${id}`);
  },
};

const lessonActions: LessonActions = {
  onJoin(id) {
    alert(`Join ${id}`);
  },
  onRebook(id) {
    alert(`Rebook ${id}`);
  },
  onCancel(id) {
    alert(`Cancel ${id}`);
  },
  onEdit(id) {
    alert(`Edit ${id}`);
  },
};

const makeLesson = ({
  hour,
  duration,
  date,
}: {
  hour: number;
  duration: number;
  date: Dayjs;
}): LessonProps => {
  const start = date.startOf("day").add(hour, "hours");
  return {
    id: random(1000),
    start: start.toISOString(),
    end: start.add(duration, "hours").toISOString(),
    otherMember: {
      id: faker.number.int(),
      name: faker.person.fullName(),
      image: sample([
        null,
        faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      ]),
    },
    canceled: false,
  };
};

const makeSlot = ({
  hour,
  duration,
  date,
  membersCount = 2,
}: {
  hour: number;
  duration: number;
  date: Dayjs;
  membersCount?: number;
}): AvailabilitySlotProps => {
  const start = date.startOf("day").add(hour, "hours");
  return {
    id: random(1000),
    start: start.toISOString(),
    end: start.add(duration, "hours").toISOString(),
    members: range(membersCount).map((idx) => ({
      id: idx,
      name: faker.person.fullName(),
      image: sample([
        null,
        faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      ]),
    })),
  };
};

const date = dayjs().startOf("week");

export const HourViewCalender: StoryObj<Component> = {
  args: {
    date: dayjs().startOf("week"),
    lessons: [
      makeLesson({ hour: 1, duration: 2, date }),
      makeLesson({ hour: 1, duration: 2, date }),
      makeLesson({ hour: 1, duration: 2, date }),
      makeLesson({ hour: 1, duration: 2, date }),
      makeLesson({ hour: 1, duration: 2, date }),
      makeLesson({ hour: 1, duration: 2, date }),
      makeLesson({ hour: 3, duration: 2, date }),
      makeLesson({ hour: 3, duration: 8, date: date.add(1, "day") }),
      makeLesson({ hour: 12, duration: 12, date: date.add(2, "day") }),
      makeLesson({ hour: 1, duration: 0.5, date: date.add(3, "day") }),
      makeLesson({ hour: 1, duration: 10, date: date.add(6, "day") }),
    ],
    lessonActions,
  },
};

export const DayViewCalender: StoryObj<Component> = {
  args: {
    slots: [
      makeSlot({ hour: 1, duration: 2, date, membersCount: 2 }),
      makeSlot({ hour: 3, duration: 2, date, membersCount: 7 }),
      makeSlot({
        hour: 3,
        duration: 8,
        date: date.add(1, "day"),
        membersCount: 3,
      }),
      makeSlot({
        hour: 12,
        duration: 12,
        date: date.add(2, "day"),
        membersCount: 4,
      }),
      makeSlot({
        hour: 1,
        duration: 0.5,
        date: date.add(3, "day"),
        membersCount: 3,
      }),
      makeSlot({
        hour: 1,
        duration: 10,
        date: date.add(6, "day"),
        membersCount: 3,
      }),
    ],
    date,
    slotActions,
  },
};

export default meta;
