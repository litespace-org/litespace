import type { Meta, StoryObj } from "@storybook/react";
import { TutorCard } from "@/components/TutorCard";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";
import { range } from "lodash";

type Component = typeof TutorCard;

const meta: Meta<Component> = {
  title: "TutorCard",
  component: TutorCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

const makeTopics = (count: number, wordLength?: number | null) =>
  range(count).map(() => {
    return faker.word.sample({ length: wordLength || { min: 5, max: 15 } });
  });

export const Primary: StoryObj<Component> = {
  args: {
    id: 1,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: 12,
    lessonCount: 40,
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
    topics: [],
  },
};

export const HighStats: StoryObj<Component> = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: 2000,
    lessonCount: 7123,
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
    topics: [],
  },
};

export const WithTopics: StoryObj<Component> = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: 2000,
    lessonCount: 7123,
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
    topics: makeTopics(12),
  },
};

export default meta;
