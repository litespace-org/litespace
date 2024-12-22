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

const makeTopics = (count: number, wordLength: number = 10) =>
  range(count).map(() =>
    faker.lorem.word({ length: wordLength || { min: 10, max: 30 } })
  );

export const TutorWithAllStats: Story = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 1, max: 2000 }),
    lessonCount: faker.number.int({ min: 1, max: 2000 }),
    rating: faker.number.int({ min: 0, max: 5 }),
    imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
    topics: makeTopics(8),
  },
};

export const OnelineTopics: Story = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 1, max: 200 }),
    lessonCount: faker.number.int({ min: 1, max: 200 }),
    rating: 0,
    imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
    topics: makeTopics(11),
  },
};

export const LargeTopicWords: Story = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: faker.number.int({ min: 1_000, max: 10_900 }),
    lessonCount: faker.number.int({ min: 1_000, max: 10_900 }),
    rating: 0,
    imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
    topics: makeTopics(14, 30),
  },
};

export const TutorWithoutStats: Story = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: 0,
    lessonCount: 0,
    rating: 0,
    imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
    topics: makeTopics(20),
  },
};

export const TutorWithoutRating: Story = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: 4,
    lessonCount: 4,
    rating: 0,
    imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
    topics: makeTopics(45),
  },
};

export default meta;
