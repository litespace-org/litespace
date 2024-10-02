import type { Meta, StoryObj } from "@storybook/react";
import { ActivityGrid, ActivityMap } from "@/components/ActivityGrid";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { GridDay } from "@/components/ActivityGrid/types";
import dayjs from "@/lib/dayjs";

type Component = typeof ActivityGrid;

const meta: Meta<Component> = {
  title: "ActivityGrid",
  component: ActivityGrid,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

function makeActivityMap() {
  const activityMap: ActivityMap = {};
  const today = dayjs().startOf("day");

  for (let i = 0; i <= 356; i++) {
    const day = today.subtract(i, "days").startOf("day");
    activityMap[day.format("YYYY-MM-DD")] = { score: (i % 7) % 5 };
  }

  return activityMap;
}

export const Primary: StoryObj<Component> = {
  args: {
    map: makeActivityMap(),
    tooltip: (day: GridDay) => day.date.format("dddd, DD MMMM, YYYY"),
  },
};

export const SetStartDay: StoryObj<Component> = {
  args: {
    map: makeActivityMap(),
    tooltip: (day: GridDay) => day.date.format("dddd, DD MMMM, YYYY"),
    start: dayjs().subtract(100, "days"),
  },
};

export default meta;
