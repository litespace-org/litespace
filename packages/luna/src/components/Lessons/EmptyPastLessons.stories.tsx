import { Meta, StoryObj } from "@storybook/react";
import EmptyPastLessons from "@/components/Lessons/EmptyPastLessons";

const meta: Meta<typeof EmptyPastLessons> = {
	title: "Lessons/EmptyPastLessons",
	component: EmptyPastLessons,
};

export default meta;

type Story = StoryObj<typeof EmptyPastLessons>;

export const Default: Story = {
	args: {},
};
