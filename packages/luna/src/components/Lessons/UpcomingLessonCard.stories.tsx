import { Meta, StoryObj } from "@storybook/react";
import UpcomingLessonCard from "./UpcomingLessonCard";
import { CardProps } from "./UpcomingLessonCard";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<CardProps> = {
  title: "Lessons/UpcomingLessonCard",
  component: UpcomingLessonCard,
};
export default meta;

const url = "https://picsum.photos/400";

type Story = StoryObj<CardProps>;

export const CannotJoinLesson: Story = {
  args: {
    canceled: false,
    start: dayjs.utc().add(15, "minutes").toISOString(),
    duration: 3,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      studentCount: 3,
      rating: 3.4,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const CanJoinLesson: Story = {
  args: {
    canceled: false,
    start: dayjs.utc().add(5, "minutes").toISOString(),
    duration: 3,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      studentCount: 3,
      rating: 3.4,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const Canceled: Story = {
  args: {
    canceled: true,
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