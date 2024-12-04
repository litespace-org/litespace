import type { Meta, StoryObj } from "@storybook/react";
import { TutorFeedbackCard } from "@/components/TutorProfile";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import React from "react";

type Component = typeof TutorFeedbackCard;

const meta: Meta<Component> = {
  component: TutorFeedbackCard,
  parameters: { layout: "centered" },
  decorators: [(Story) => <Story />, DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    id: 5,
    name: faker.person.fullName(),
    imageUrl: "https://picsum.photos/200",
    feedback: faker.lorem.words(20),
  },
};

export const LowWordNumber: StoryObj<Component> = {
  args: {
    id: 5,
    name: faker.person.fullName(),
    feedback: faker.lorem.words(5),
    imageUrl: "https://picsum.photos/200",
  },
};

export const HighWordNumber: StoryObj<Component> = {
  args: {
    id: 5,
    name: faker.person.fullName(),
    feedback: faker.lorem.words(50),
    imageUrl: "https://picsum.photos/200",
  },
};

export default meta;
