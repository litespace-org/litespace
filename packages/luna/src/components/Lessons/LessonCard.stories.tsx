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

export const BeforeJoinForStudent: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().add(15, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const BeforeJoinForTutor: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().add(15, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "student",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const CanJoinLesson: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().add(5, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const CanJoinLessonNow: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(2, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const AfterLessonStarted: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(5, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const LessonAboutToEnd: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(15, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const AfterLessonFinishForStudent: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(35, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const AfterLessonFinishForTutor: Story = {
  args: {
    canceled: null,
    start: dayjs.utc().subtract(35, "minutes").toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "student",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
    onSendMsg: () => console.log("sendMsg"),
  },
};

export const CanceledByTutor: Story = {
  args: {
    canceled: "tutor",
    start: new Date().toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
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
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "student",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const CanceledByCurTutor: Story = {
  args: {
    canceled: "tutor",
    start: new Date().toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "student",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};

export const CanceledByCurStudent: Story = {
  args: {
    canceled: "student",
    start: new Date().toISOString(),
    duration: 30,
    member: {
      id: 30,
      name: faker.person.fullName(),
      image: url,
      role: "tutor",
    },
    onJoin: () => console.log("join"),
    onCancel: () => console.log("cancel"),
  },
};
