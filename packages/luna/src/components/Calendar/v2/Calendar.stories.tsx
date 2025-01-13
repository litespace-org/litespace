import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar/v2/Calendar";
import React from "react";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";
import { faker } from "@faker-js/faker/locale/en";
import { AvailabilitySlotProps } from "./types";

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

const getRandSlots = (): AvailabilitySlotProps[] => {
  const res: AvailabilitySlotProps[] = [];
  const count = faker.number.int({ min: 3, max: 10 });
  for (let i = 0; i < count; i++) {
    res.push(getRandSlot({}));
  }
  return res;
};

const getRandSlot = ({
  from,
  to,
}: {
  from?: number;
  to?: number;
}): AvailabilitySlotProps => {
  const afterDays = faker.number.int({ min: 0, max: 6 });
  const date = dayjs().startOf("week").add(afterDays, "days");

  const min = from && from < 23 ? from : 1;
  const max = to && to < 23 ? to : 23;

  const randInt = faker.number.int({ min, max });

  return {
    id: 1,
    start: date.startOf("day").add(randInt, "hours").toString(),
    end: date
      .startOf("day")
      .add(faker.number.int({ min: randInt, max: max + 1 }), "hours")
      .toString(),
    members: [],
    avatarsCount: 3,
  };
};

export const HourViewCalender: StoryObj<Component> = {
  args: {
    HourView,
    date: dayjs().startOf("week"),
  },
};

export const DayViewCalender: StoryObj<Component> = {
  args: {
    slots: getRandSlots(),
    date: dayjs().startOf("week"),
  },
};

export default meta;
