import React from "react";
import { TutorOverview } from "@/components/TutorOverview";
import { Meta, StoryObj } from "@storybook/react";

type Story = StoryObj<typeof TutorOverview>;

const meta: Meta<typeof TutorOverview> = {
  title: "TutorOverview",
  component: TutorOverview,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[90vw] mx-auto">
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
    totalTutoringTime: 120,
    studentCount: 4,
  },
};

export const Loading: Story = {
  args: {
    totalLessonCount: 44,
    completedLessonCount: 17,
    totalTutoringTime: 120,
    studentCount: 4,
    loading: true,
  },
};

export const Error: Story = {
  args: {
    totalLessonCount: 44,
    completedLessonCount: 17,
    totalTutoringTime: 120,
    studentCount: 4,
    error: true,
    retry: () => alert("retry"),
  },
};

export const Below1Hour: Story = {
  args: {
    totalLessonCount: 44,
    completedLessonCount: 17,
    totalTutoringTime: 37,
    studentCount: 4,
  },
};

export const Below1000Hours: Story = {
  args: {
    totalLessonCount: 0,
    completedLessonCount: 0,
    totalTutoringTime: 60 * 980,
    studentCount: 4,
  },
};

export const HighNumbers: Story = {
  args: {
    totalLessonCount: 44_986,
    completedLessonCount: 99_766,
    totalTutoringTime: 60_050_0,
    studentCount: 1200,
  },
};

export const Empty: Story = {
  args: {
    totalLessonCount: 0,
    completedLessonCount: 0,
    totalTutoringTime: 0,
    studentCount: 0,
  },
};
