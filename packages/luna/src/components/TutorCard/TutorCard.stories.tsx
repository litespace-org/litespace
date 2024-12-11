import type { Meta, StoryObj } from "@storybook/react";
import { TutorCard } from "@/components/TutorCard";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof TutorCard;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "TutorCard",
  component: TutorCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="tw-w-64 tw-h-[383px]">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

export const Primary: Story = {
  args: {
    profileId: 4,
    studentId: 1,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    comment: faker.lorem.words(10),
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
  },
};

export const UnkownStudent: Story = {
  args: {
    profileId: 4,
    studentId: 2,
    studentName: null,
    tutorName: faker.person.fullName(),
    comment: faker.lorem.words(40),
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
  },
};

export const WithoutComment: Story = {
  args: {
    profileId: 4,
    studentId: 3,
    studentName: null,
    tutorName: faker.person.fullName(),
    comment: null,
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
  },
};

export const HighStats: Story = {
  args: {
    profileId: 4,
    studentId: 15,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    comment: faker.lorem.words(50),
    rating: 4.85,
    imageUrl: "https://picsum.photos/200",
  },
};

export const OwnerOfComment: Story = {
  args: {
    profileId: 4,
    studentId: 4,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    comment: faker.lorem.words(10),
    rating: 2.85,
    imageUrl: "https://picsum.photos/200",
  },
};

export default meta;
