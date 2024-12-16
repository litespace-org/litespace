import { Meta, StoryObj } from "@storybook/react";
import { CancelLesson } from "@/components/Lessons/CancelLesson/CancelLesson";

const meta: Meta<typeof CancelLesson> = {
  title: "Lessons/CancelLesson",
  component: CancelLesson,
};

export default meta;

type Story = StoryObj<typeof CancelLesson>;

export const Default: Story = {
  args: {
    id: 4,
    close: () => alert("closing dialog"),
    onCancel: () => alert("cancelled the lesson"),
  },
};
