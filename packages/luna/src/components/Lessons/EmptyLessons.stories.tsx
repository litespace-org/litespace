import { Meta, StoryObj } from "@storybook/react";
import { EmptyLessonsPage as EmptyLessons } from "@/components/Lessons/EmptyLessons";

const meta: Meta<typeof EmptyLessons> = {
  title: "lessons/EmptyLessons",
  component: EmptyLessons,
};

export default meta;

type Story = StoryObj<typeof EmptyLessons>;

export const Default: Story = {
  args: {},
};
