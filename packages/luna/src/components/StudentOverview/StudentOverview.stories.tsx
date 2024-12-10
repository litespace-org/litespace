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
    totalLessons: 44,
    completedLessons: 17,
    totalLearningTime: 120,
    badges: 4,
  },
};

export const Empty: Story = {
  args: {
    totalLessons: 0,
    completedLessons: 0,
    totalLearningTime: 0,
    badges: 0,
  },
};
