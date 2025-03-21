import type { Meta, StoryObj } from "@storybook/react";
import Timer from "@/components/Session/Timer";
import dayjs from "@/lib/dayjs";

type Component = typeof Timer;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Session/Timer",
  component: Timer,
  parameters: {
    layout: "centered",
  },
};

export const BeforeLessonOneMinute: Story = {
  args: {
    start: dayjs().add(1, "minute").toISOString(),
    duration: 30,
  },
};

export const BeforeLessonNMinutes: Story = {
  args: {
    start: dayjs().add(3, "minutes").toISOString(),
    duration: 30,
  },
};

export const BeforeLessonOneDay: Story = {
  args: {
    start: dayjs().add(1, "day").toISOString(),
    duration: 30,
  },
};

export const BeforeLessonOneWeek: Story = {
  args: {
    start: dayjs().add(1, "week").toISOString(),
    duration: 30,
  },
};

export const DurationLesson: Story = {
  args: {
    start: dayjs().subtract(5, "minute").toISOString(),
    duration: 30,
  },
};

export const DurationLessonOneMinuteLeft: Story = {
  args: {
    start: dayjs().subtract(28, "minute").toISOString(),
    duration: 30,
  },
};

export const AfterLessonOneMinutes: Story = {
  args: {
    start: dayjs().subtract(31, "minute").toISOString(),
    duration: 30,
  },
};

export const AfterLessonThreeMinutes: Story = {
  args: {
    start: dayjs().subtract(33, "minute").toISOString(),
    duration: 30,
  },
};

export const AfterLessonOneWeek: Story = {
  args: {
    start: dayjs().subtract(1, "week").toISOString(),
    duration: 30,
  },
};

export const AfterLessonThreeWeeks: Story = {
  args: {
    start: dayjs().subtract(1, "week").toISOString(),
    duration: 30,
  },
};

export default meta;
