import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import DialogComponent from "./EditDialog";
import { faker } from "@faker-js/faker/locale/ar";

type Story = StoryObj<typeof DialogComponent>;
const meta: Meta<typeof DialogComponent> = {
  title: "TutorCard/EditDialog",
  component: DialogComponent,
  decorators: [
    (Story) => (
      <div style={{ width: "744px" }} className="[&>*]:tw-w-full">
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
    studentName: faker.person.fullName(),
    tutorName: faker.person.fullName(),
    studentId: 1,
    imageUrl: url,
    open: true,
    setOpen: () => {},
  },
};

export default meta;
