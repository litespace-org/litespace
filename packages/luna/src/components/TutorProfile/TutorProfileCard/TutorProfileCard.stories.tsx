import type { Meta, StoryObj } from "@storybook/react";
import { TutorProfileCard } from "@/components/TutorProfile";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof TutorProfileCard;

const meta: Meta<Component> = {
  component: TutorProfileCard,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    studentCount: 12,
    lessonCount: 40,
    avgRating: 4.85,
    image: "https://picsum.photos/200",
  },
};

export const WithoutAchivements: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    studentCount: 3,
    lessonCount: 3,
    avgRating: 4.85,
    image: "https://picsum.photos/200",
  },
};

export const LongBio: StoryObj<Component> = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(20),
    studentCount: 2000,
    lessonCount: 7123,
    avgRating: 4.85,
    image: "https://picsum.photos/200",
  },
};

export const ShortBio: StoryObj<Component> = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(4),
    studentCount: 2000,
    lessonCount: 7123,
    avgRating: 4.85,
    image: "https://picsum.photos/200",
  },
};

export default meta;
