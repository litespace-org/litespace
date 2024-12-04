import type { Meta, StoryObj } from "@storybook/react";
import { TutorProfileCard } from "@/components/TutorProfile";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof TutorProfileCard;

const meta: Meta<Component> = {
  component: TutorProfileCard,
  parameters: { layout: "centered" },
  decorators: [(Story) => <Story />, DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    studentCount: 12,
    lessonCount: 40,
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
  },
};

export const HighStats: StoryObj<Component> = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    studentCount: 2000,
    lessonCount: 7123,
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
  },
};

export default meta;
