import { Meta, StoryObj } from "@storybook/react";
import LessonCard, { Props } from "@/components/Lessons/LessonCard";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<Props> = {
  title: "Lessons/LessonCard",
  component: LessonCard,
};
export default meta;

const url = "https://picsum.photos/400";

type Story = StoryObj<Props>;

export const BeforeJoin: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().add(15, "minutes").toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const CanJoinLesson: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().add(5, "minutes").toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const CanJoinLessonNow: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(2, "minutes").toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const AfterLessonStarted: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(5, "minutes").toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const LessonAboutToEnd: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(15, "minutes").toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const AfterLessonFinish: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(35, "minutes").toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const CanceledByTutor: Story = {
  args: {
    canceled: "tutor",
    start: new Date().toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const CanceledByStudent: Story = {
  args: {
    canceled: "student",
    start: new Date().toISOString(),
    duration: 30,
    tutor: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};
