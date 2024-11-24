import type { Meta, StoryObj } from "@storybook/react";
import { Lessons } from "@/components/Calendar/v2/Events/Lessons";
import { faker } from "@faker-js/faker/locale/ar";
import dayjs from "@/lib/dayjs";

type Component = typeof Lessons;

const meta: Meta<Component> = {
  title: "Calendar Lesson Events",
  component: Lessons,
  parameters: { layout: "centered" },
  decorators: [],
};

const actions = {
  onEdit: (id: number) => alert(`Edit: ${id}`),
  onCancel: (id: number) => alert(`Cancel: ${id}`),
  onRebook: (id: number) => alert(`Rebook: ${id}`),
};

export const SingleLessonWithAvatar: StoryObj<Component> = {
  args: {
    ...actions,
    lessons: [
      {
        id: 1,
        otherMember: {
          id: 1,
          image: "https://picsum.photos/200",
          name: faker.person.fullName(),
        },
        start: dayjs().startOf("hour").toString(),
        end: dayjs().startOf("hour").add(30, "minute").toISOString(),
        canceled: false,
      },
    ],
  },
};

export const SingleLessonWithoutAvatarAndName: StoryObj<Component> = {
  args: {
    ...actions,
    lessons: [
      {
        id: 1,
        otherMember: { id: 2, image: null, name: null },
        start: dayjs().startOf("hour").toString(),
        end: dayjs().startOf("hour").add(30, "minute").toISOString(),
        canceled: false,
      },
    ],
  },
};

export const SingleLessonCanceled: StoryObj<Component> = {
  args: {
    ...actions,
    lessons: [
      {
        id: 1,
        otherMember: {
          id: 3,
          image: "https://picsum.photos/200",
          name: faker.person.fullName(),
        },
        start: dayjs().startOf("hour").toString(),
        end: dayjs().startOf("hour").add(30, "minute").toISOString(),
        canceled: true,
      },
    ],
  },
};

export const TwoLessons: StoryObj<Component> = {
  args: {
    ...actions,
    lessons: [
      {
        id: 1,
        otherMember: {
          id: 4,
          image: "https://picsum.photos/200",
          name: faker.person.fullName(),
        },
        start: dayjs().startOf("hour").toString(),
        end: dayjs().startOf("hour").add(30, "minute").toISOString(),
        canceled: true,
      },
      {
        id: 2,
        otherMember: {
          id: 5,
          image: "https://picsum.photos/300",
          name: faker.person.fullName(),
        },
        start: dayjs().startOf("hour").add(30, "minutes").toString(),
        end: dayjs().startOf("hour").add(45, "minute").toISOString(),
        canceled: true,
      },
    ],
  },
};

const start = dayjs().startOf("hour");

export const FourLessons: StoryObj<Component> = {
  args: {
    ...actions,
    lessons: [
      {
        id: 3,
        otherMember: {
          id: 6,
          image: "https://picsum.photos/400",
          name: faker.person.fullName(),
        },
        start: start.toString(),
        end: start.add(15, "minute").toISOString(),
        canceled: true,
      },
      {
        id: 4,
        otherMember: {
          id: 7,
          image: "https://picsum.photos/500",
          name: faker.person.fullName(),
        },
        start: start.add(15, "minutes").toString(),
        end: start.add(30, "minute").toISOString(),
        canceled: false,
      },
      {
        id: 5,
        otherMember: {
          id: 8,
          image: "https://picsum.photos/600",
          name: faker.lorem.words(6),
        },
        start: start.add(30, "minute").toISOString(),
        end: start.add(45, "minute").toISOString(),
        canceled: true,
      },
      {
        id: 6,
        otherMember: {
          id: 9,
          image: "https://picsum.photos/700",
          name: faker.person.fullName(),
        },
        start: start.add(45, "minute").toISOString(),
        end: start.add(60, "minute").toISOString(),
        canceled: false,
      },
    ],
  },
};

export default meta;
