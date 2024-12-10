import React from "react";
import { StudentOverview } from "@/components/StudentOverview/StudentOverview";
import { Meta, StoryObj } from "@storybook/react";

type Story = StoryObj<typeof StudentOverview>;

const meta: Meta<typeof StudentOverview> = {
  title: "StudentOverview",
  component: StudentOverview,
  decorators: [
    (Story) => (
      <div className="tw-w-[816px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const Primary: Story = {
  args: {
    totalLessonCount: 44,
    completedLessonCount: 17,
    totalLearningTime: 120,
    badgesCount: 4,
  },
};

export const HighNumbers: Story = {
  args: {
    totalLessonCount: 44_986,
    completedLessonCount: 99_766,
    totalLearningTime: 120_831,
    badgesCount: 4,
  },
};

export const Empty: Story = {
  args: {
    totalLessonCount: 0,
    completedLessonCount: 0,
    totalLearningTime: 0,
    badgesCount: 0,
  },
};
