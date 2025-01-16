import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar/v2/Calendar";
import React from "react";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { faker } from "@faker-js/faker/locale/en";
import { AvailabilitySlotProps } from "./types";
import { random, range, sample } from "lodash";

type Component = typeof Calendar;

const meta: Meta<Component> = {
  title: "Calendar/V2",
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

const HourView: React.FC<{ date: Dayjs }> = ({ date }) => {
  if (Math.random() > 0.5) return null;
  return (
    <div className="tw-p-1 tw-text-natural-950">{date.format("hh:mm a")}</div>
  );
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

export const HourViewCalender: StoryObj<Component> = {
  args: {
    HourView,
    date: dayjs().startOf("week"),
  },
};

const date = dayjs().startOf("week");

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
    slotActions: {
      onDelete(id) {
        alert(`Delete ${id}`);
      },
      onEdit(id) {
        alert(`Edit ${id}`);
      },
    },
  },
};

export default meta;
