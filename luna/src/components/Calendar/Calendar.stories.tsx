import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar";
import { Direction } from "@/components/Direction";
import { IEvent } from "@/components/Calendar/types";
import ar from "@/locales/ar-eg.json";
import dayjs from "@/lib/dayjs";
import { Dayjs } from "dayjs";

type Component = typeof Calendar;

const meta: Meta<Component> = {
  title: "Calendar",
  component: Calendar,
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="font-cairo text-foreground bg-dash-sidebar w-full min-h-screen flex text-center justify-center">
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
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: dayjs().startOf("day").add(1, "hour").toISOString(),
    end: dayjs().startOf("day").add(5, "hours").toISOString(),
  },
  {
    id: 1,
    wrapper: false,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
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
