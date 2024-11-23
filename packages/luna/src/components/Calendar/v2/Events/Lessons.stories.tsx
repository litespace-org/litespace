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

export const SingleLessonWithAvatar: StoryObj<Component> = {
  args: {
    lessons: [
      {
        otherMember: {
          image: "https://avatar.iran.liara.run/public/boy",
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
    lessons: [
      {
        otherMember: { image: null, name: null },
        start: dayjs().startOf("hour").toString(),
        end: dayjs().startOf("hour").add(30, "minute").toISOString(),
        canceled: false,
      },
    ],
  },
};

export const SingleLessonCanceled: StoryObj<Component> = {
  args: {
    lessons: [
      {
        otherMember: {
          image: "https://xsgames.co/randomusers/avatar.php?g=male",
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
    lessons: [
      {
        otherMember: {
          image: "https://xsgames.co/randomusers/avatar.php?g=male",
          name: faker.person.fullName(),
        },
        start: dayjs().startOf("hour").toString(),
        end: dayjs().startOf("hour").add(30, "minute").toISOString(),
        canceled: true,
      },
      {
        otherMember: {
          image: "https:xsgames.co/randomusers/avatar.php?g=pixel",
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
    lessons: [
      {
        otherMember: {
          image: "https://xsgames.co/randomusers/avatar.php?g=male",
          name: faker.person.fullName(),
        },
        start: start.toString(),
        end: start.add(15, "minute").toISOString(),
        canceled: true,
      },
      {
        otherMember: {
          image: "https:xsgames.co/randomusers/avatar.php?g=pixel",
          name: faker.person.fullName(),
        },
        start: start.add(15, "minutes").toString(),
        end: start.add(30, "minute").toISOString(),
        canceled: false,
      },
      {
        otherMember: {
          image: "https://xsgames.co/randomusers/avatar.php?g=male",
          name: faker.lorem.words(6),
        },
        start: start.add(30, "minute").toISOString(),
        end: start.add(45, "minute").toISOString(),
        canceled: true,
      },
      {
        otherMember: {
          image: "https:xsgames.co/randomusers/avatar.php?g=pixel",
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
