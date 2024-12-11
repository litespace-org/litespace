import React from "react";
import { faker } from "@faker-js/faker/locale/ar";
import { Meta, StoryObj } from "@storybook/react";
import { EditRating } from "@/components/TutorFeedback";

type Story = StoryObj<typeof EditRating>;
const meta: Meta<typeof EditRating> = {
  title: "TutorFeedback/EditRating",
  component: EditRating,
  decorators: [
    (Story) => (
      <div style={{ width: "744px" }}>
        <Story />
      </div>
    ),
  ],
};

const url = "https://picsum.photos/200";

export const WithComment: Story = {
  args: {
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    studentId: 1,
    imageUrl: url,
    comment: faker.lorem.words(20),
    rating: 3,
    open: true,
    setOpen: () => {},
  },
};

export const WithoutComment: Story = {
  args: {
    rating: 0,
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    studentId: 1,
    imageUrl: url,
    open: true,
    setOpen: () => {},
  },
};

export default meta;
