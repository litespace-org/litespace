import React from "react";
import { faker } from "@faker-js/faker/locale/ar";
import { Meta, StoryObj } from "@storybook/react";
import { RatingDialog } from "@/components/TutorFeedback";

type Story = StoryObj<typeof RatingDialog>;
const meta: Meta<typeof RatingDialog> = {
  title: "TutorFeedback/RatingDialog",
  component: RatingDialog,
  decorators: [
    (Story) => (
      <div style={{ width: "744px" }}>
        <Story />
      </div>
    ),
  ],
};

const url = "https://picsum.photos/200";

export const WithFeedback: Story = {
  args: {
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    studentId: 1,
    imageUrl: url,
    feedback: faker.lorem.words(20),
    rating: 3,
    open: true,
    setOpen: () => {},
    onSubmit: () => alert("update rating"),
  },
};

export const WithoutFeedback: Story = {
  args: {
    rating: 0,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    studentId: 1,
    imageUrl: url,
    open: true,
    setOpen: () => {},
    onSubmit: () => alert("update rating"),
  },
};

export default meta;
