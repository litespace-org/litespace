import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar";
import { Direction } from "@/components/Direction";
import { IEvent } from "@/components/Calendar/types";
import ar from "@/locales/ar-eg.json";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";

type Component = typeof Calendar;

const meta: Meta<Component> = {
  title: "Calendar/V1",
  component: Calendar,
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="tw-font-cairo tw-text-foreground tw-bg-dash-sidebar tw-w-full tw-min-h-screen tw-flex tw-text-center tw-justify-center">
          <Story />
        </div>
      </Direction>
    ),
  ],
};

const events: IEvent[] = [
  {
    id: 0,
    wrapper: false,
    title: ar["banks.labels.cib"],
    start: dayjs().startOf("day").add(1, "hour").toISOString(),
    end: dayjs().startOf("day").add(5, "hours").toISOString(),
  },
  {
    id: 1,
    wrapper: false,
    title: ar["banks.labels.alex"],
    start: dayjs().add(1, "day").startOf("day").add(10, "hour").toISOString(),
    end: dayjs().add(1, "day").startOf("day").add(15, "hours").toISOString(),
  },
];

export const Primary: StoryObj<Component> = {
  args: {
    events,
    onNextWeek(day: Dayjs) {
      console.log("Next week:", day.format("YYYY-MM-DD"));
    },
    onPrevWeek(day: Dayjs) {
      console.log("Prev. week", day.format("YYYY-MM-DD"));
    },
    onNextMonth(day: Dayjs) {
      console.log("Next month", day.format("MMMM"));
    },
    onPrevMonth(day: Dayjs) {
      console.log("Prev. month", day.format("MMMM"));
    },
  },
};

export const Loading: StoryObj<Component> = {
  args: {
    events,
    loading: true,
  },
};

export default meta;
