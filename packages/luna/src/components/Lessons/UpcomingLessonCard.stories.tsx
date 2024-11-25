import { Meta, StoryObj } from "@storybook/react";
import UpcomingLessonCard from "./UpcomingLessonCard";
import { CardProps } from "./UpcomingLessonCard";

const meta: Meta<CardProps> = {
  title: "Lessons/UpcomingLessonCard",
  component: UpcomingLessonCard,
};
export default meta;

const url = "https://picsum.photos/1900";

type Story = StoryObj<CardProps>;
export const Default: Story = {
  args: {
    start: "56473",
    duration: 3,
    tutor: {
      id: 30,
      name: "محمد عبدالعزيز",
      image: url,
      studentCount: 3,
      rating: 3.4,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};
