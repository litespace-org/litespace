import { Meta, StoryObj } from "@storybook/react";
import { TutorCardV1 } from "@/components/TutorCard";
import { CardProps } from "@/components/TutorCard/types";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";
import { range } from "lodash";

type Story = StoryObj<CardProps>;

const meta: Meta<CardProps> = {
  title: "TutorCardV1",
  component: TutorCardV1,
  decorators: [
    (Story) => (
      <div style={{ width: "568px" }}>
        <Story />
      </div>
    ),
  ],
};

const makeTopics = (count: number, wordLength?: number | null) =>
  range(count).map(() => {
    return faker.word.sample({ length: wordLength || { min: 5, max: 15 } });
  });

export const TutorWithoutName: Story = {
  args: {
    id: faker.number.int(),
    name: null,
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 10, max: 1_000 }),
    lessonCount: faker.number.int({ min: 10, max: 500 }),
    rating: faker.number.int({ min: 0, max: 5 }),
    imageUrl: faker.image.urlPicsumPhotos({ width: 1_000, height: 1_000 }),
    topics: makeTopics(12),
  },
};

export const TutorWithoutImage: Story = {
  args: {
    id: faker.number.int(),
    name: null,
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 10, max: 1_000 }),
    lessonCount: faker.number.int({ min: 10, max: 500 }),
    rating: faker.number.int({ min: 0, max: 5 }),
    imageUrl: null,
    topics: makeTopics(12),
  },
};

export const TutorWithStats: Story = {
  args: {
    id: faker.number.int(),
    name: faker.person.fullName(),
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 10, max: 1_000 }),
    lessonCount: faker.number.int({ min: 10, max: 500 }),
    rating: faker.number.int({ min: 0, max: 5 }),
    imageUrl: faker.image.urlPicsumPhotos({ width: 1_000, height: 1_000 }),
    topics: makeTopics(12),
  },
};

export const TutorWithHighStats: Story = {
  args: {
    id: faker.number.int(),
    name: faker.person.fullName(),
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 1_000, max: 10_000 }),
    lessonCount: faker.number.int({ min: 1_000, max: 10_000 }),
    rating: faker.number.int({ min: 0, max: 5 }),
    imageUrl: faker.image.urlPicsumPhotos({ width: 1_000, height: 1_000 }),
    topics: makeTopics(12, 10),
  },
};

export const TutorWithoutStats: Story = {
  args: {
    id: faker.number.int(),
    name: faker.person.fullName(),
    about: faker.lorem.paragraphs(3),
    studentCount: 0,
    lessonCount: 0,
    rating: 0,
    imageUrl: faker.image.urlPicsumPhotos({ width: 1_000, height: 1_000 }),
    topics: makeTopics(12),
  },
};

export const TutorWithoutRating: Story = {
  args: {
    id: faker.number.int(),
    name: faker.person.fullName(),
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 1, max: 200 }),
    lessonCount: faker.number.int({ min: 1, max: 200 }),
    rating: 0,
    imageUrl: faker.image.urlPicsumPhotos({ width: 1_000, height: 1_000 }),
    topics: makeTopics(12),
  },
};

export default meta;
