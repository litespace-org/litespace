import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar";
import { Direction } from "@/components/Direction";
import { IEvent } from "@/components/Calendar/types";
import ar from "@/locales/ar-eg.json";

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
    start: "2024-08-17T09:00:00.000Z",
    end: "2024-08-17T10:00:00.000Z",
  },
  {
    id: 1,
    title: ar["page.complete.profile.form.name.ar.placeholder"],
    start: "2024-08-18T09:00:00.000Z",
    end: "2024-08-18T10:00:00.000Z",
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

export const Primary: StoryObj<Component> = {
  args: {
    events,
  },
};

export default meta;
