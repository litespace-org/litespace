import type { Meta, StoryObj } from "@storybook/react";
import { TutorFeedbackCard } from "@/components/TutorProfile";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof TutorFeedbackCard;

const meta: Meta<Component> = {
  component: TutorFeedbackCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="tw-w-[265px]">
        <Story />
      </div>
    ),
    DarkStoryWrapper,
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    id: 5,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    imageUrl: "https://picsum.photos/200",
    feedback: faker.lorem.words(20),
  },
};

export const WithoutImage: StoryObj<Component> = {
  args: {
    id: 5,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    imageUrl: null,
    feedback: faker.lorem.words(20),
  },
};

export const WithoutStudentName: StoryObj<Component> = {
  args: {
    id: 5,
    studentName: null,
    tutorName: faker.person.fullName(),
    imageUrl: "https://picsum.photos/200",
    feedback: faker.lorem.words(20),
  },
};

export const WithoutTutorName: StoryObj<Component> = {
  args: {
    id: 5,
    studentName: null,
    tutorName: null,
    imageUrl: "https://picsum.photos/200",
    feedback: faker.lorem.words(20),
  },
};

export const ShortFeedback: StoryObj<Component> = {
  args: {
    id: 5,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    feedback: faker.lorem.words(5),
    imageUrl: "https://picsum.photos/200",
  },
};

export const LongFeedback: StoryObj<Component> = {
  args: {
    id: 5,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    feedback: faker.lorem.words(50),
    imageUrl: "https://picsum.photos/200",
  },
};

export const ExternallyLongFeedback: StoryObj<Component> = {
  args: {
    id: 5,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    feedback: faker.lorem.words(100),
    imageUrl: "https://picsum.photos/200",
  },
};

export default meta;
