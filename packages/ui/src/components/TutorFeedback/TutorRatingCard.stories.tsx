import React from "react";
import { TutorRatingCard } from "@/components/TutorFeedback";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import type { Meta, StoryObj } from "@storybook/react";

type Component = typeof TutorRatingCard;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "TutorFeedback/TutorRatingCard",
  component: TutorRatingCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-64 h-[383px]">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

export const Primary: Story = {
  args: {
    owner: false,
    studentId: 1,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    feedback: faker.lorem.words(10),
    rating: 4.85,
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
  },
};

export const UnkownStudent: Story = {
  args: {
    owner: false,
    studentId: 2,
    studentName: null,
    tutorName: faker.person.fullName(),
    feedback: faker.lorem.words(40),
    rating: 4.85,
  },
};

export const WithoutComment: Story = {
  args: {
    owner: false,
    studentId: 3,
    studentName: null,
    tutorName: faker.person.fullName(),
    feedback: null,
    rating: 4.85,
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
  },
};

export const HighStats: Story = {
  args: {
    owner: false,
    studentId: 15,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    feedback: faker.lorem.words(50),
    rating: 4.85,
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
  },
};

export const RatingOwner: Story = {
  args: {
    owner: true,
    studentId: 4,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    feedback: faker.lorem.words(10),
    rating: 2.85,
    imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    onEdit: () => alert("edit rating"),
    onDelete: () => alert("delete rating"),
  },
};

export default meta;
