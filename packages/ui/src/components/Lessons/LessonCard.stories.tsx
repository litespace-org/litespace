import { Meta, StoryObj } from "@storybook/react";
import LessonCard, { Props } from "@/components/Lessons/LessonCard";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

const meta: Meta<Props> = {
  title: "Lessons/LessonCard",
  component: LessonCard,
};
export default meta;

const url = "https://picsum.photos/400";

type Story = StoryObj<Props>;

const actions = {
  onJoin: () => alert("join"),
  onCancel: () => alert("cancel"),
  onSendMsg: () => alert("send message"),
  onRebook: () => alert("rebook"),
};

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
      topics: range(7).map(() => faker.lorem.words(1)),
      level: "C1"
    },
    ...actions,
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
      topics: range(7).map(() => faker.lorem.words(1)),
      level: "C1"
    },
    ...actions,
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
      topics: range(7).map(() => faker.lorem.words(1)),
      level: "C1",
    },
    ...actions,
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
      topics: range(7).map(() => faker.lorem.words(1)),
      level: "C1",
    },
    ...actions,
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
      topics: range(7).map(() => faker.lorem.words(1)),
      level: "C1",
    },
    ...actions,
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
      topics: range(7).map(() => faker.lorem.words(1)),
      level: "C1",
    },
    ...actions,
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
      topics: range(7).map(() => faker.lorem.words(1)),
      level: "C1",
    },
    ...actions,
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
    ...actions,
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
    ...actions,
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
    ...actions,
  },
};

export const CanceledByCurrentTutor: Story = {
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
    ...actions,
  },
};

export const CanceledByCurrentStudent: Story = {
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
    ...actions,
  },
};
