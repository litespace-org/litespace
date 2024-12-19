import { Meta, StoryObj } from "@storybook/react";
import { TutorCardV1 } from "@/components/TutorCard";
import { CardProps } from "@/components/TutorCard/types";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

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

export const Default: Story = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: 2000,
    lessonCount: 7123,
    rating: 4.85,
    imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
  },
};

export const ZeroStudentsLessonsRating: Story = {
  args: {
    id: 2,
    name: faker.person.fullName(),
    bio: faker.lorem.words(10),
    about: faker.lorem.paragraphs(3),
    studentCount: 0,
    lessonCount: 0,
    rating: 0,
    imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 300 }),
    topics: [
      "psychology",
      "games",
      "music",
      "food",
      "psychology",
      "games",
      "music",
      "food",
      "music",
      "food",
      "psychology",
      "games",
      "music",
      "food",
    ],
  },
};

export default meta;
