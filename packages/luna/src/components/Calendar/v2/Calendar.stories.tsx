import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar/v2/Calendar";
import React, { useState } from "react";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";

type Component = typeof Calendar;

const meta: Meta<Component> = {
  title: "CalendarV2",
  component: Calendar,
  parameters: { layout: "centered" },
  decorators: [],
};

const HourView: React.FC<{ date: Dayjs }> = ({ date }) => {
  if (Math.random() > 0.5) return null;
  return (
    <div className="tw-p-1 tw-text-natural-950">{date.format("hh:mm a")}</div>
  );
};

export const Primary: StoryObj<Component> = {
  args: {},
  render() {
    const [date, setDate] = useState(dayjs().startOf("week"));

    return (
      <Calendar
        date={date}
        nextWeek={() => setDate(date.add(1, "week"))}
        prevWeek={() => setDate(date.subtract(1, "week"))}
        HourView={HourView}
      />
    );
  },
};

export default meta;
