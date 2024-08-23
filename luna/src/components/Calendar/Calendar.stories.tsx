import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar";
import { Direction } from "@/components/Direction";
import { IEvent } from "@/components/Calendar/types";
import ar from "@/locales/ar-eg.json";
import dayjs from "@/lib/dayjs";

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
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: dayjs().startOf("day").add(1, "hour").toISOString(),
    end: dayjs().startOf("day").add(5, "hours").toISOString(),
  },
  {
    id: 1,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: dayjs().add(1, "day").startOf("day").add(10, "hour").toISOString(),
    end: dayjs().add(1, "day").startOf("day").add(15, "hours").toISOString(),
  },
  {
    id: 2,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-18T10:00:00.000Z",
    end: "2024-08-18T11:00:00.000Z",
  },
  {
    id: 3,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-18T12:30:00.000Z",
    end: "2024-08-18T13:30:00.000Z",
  },
  {
    id: 5,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-19T09:00:00.000Z",
    end: "2024-08-19T10:00:00.000Z",
  },
  {
    id: 6,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-19T12:30:00.000Z",
    end: "2024-08-19T13:30:00.000Z",
  },
  {
    id: 7,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-21T08:00:00.000Z",
    end: "2024-08-21T13:30:00.000Z",
  },
  {
    id: 8,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-21T08:15:00.000Z",
    end: "2024-08-21T08:30:00.000Z",
  },
  {
    id: 9,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-21T09:15:00.000Z",
    end: "2024-08-21T09:45:00.000Z",
  },
  {
    id: 9,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-25T08:15:00.000Z",
    end: "2024-08-25T08:30:00.000Z",
  },
];

console.log(events);

export const Primary: StoryObj<Component> = {
  args: {
    events,
  },
};

export default meta;
