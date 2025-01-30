import { Meta, StoryObj } from "@storybook/react";
import { RatingDialog } from "@/components/RatingDialog";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof RatingDialog> = {
  title: "RatingDialog",
  component: RatingDialog,
};

type Story = StoryObj<typeof RatingDialog>;

export const Primary: Story = {
  args: {
    close: () => alert("close"),
    contentDescription: faker.lorem.words(20),
    contentTitle: faker.lorem.words(4),
    dialogTitle: faker.lorem.words(2),
    submitting: false,
    submit: ({
      value,
      feedback,
    }: {
      value: number;
      feedback: string | null;
    }) => {
      alert(`${feedback}, ${value}`);
    },
    maxAllowedChars: 200,
  },
};

export const WithData: Story = {
  args: {
    close: () => alert("close"),
    contentDescription: faker.lorem.words(20),
    contentTitle: faker.lorem.words(4),
    dialogTitle: faker.lorem.words(2),
    submitting: false,
    submit: ({
      value,
      feedback,
    }: {
      value: number;
      feedback: string | null;
    }) => {
      alert(`${feedback}, ${value}`);
    },
    initialFeedback: faker.lorem.words(20),
    initialRating: faker.number.int({ min: 1, max: 5 }),
    maxAllowedChars: 200,
  },
};

export const Bottom: Story = {
  args: {
    close: () => alert("close"),
    contentDescription: faker.lorem.words(20),
    contentTitle: faker.lorem.words(4),
    dialogTitle: faker.lorem.words(2),
    submitting: false,
    submit: ({
      value,
      feedback,
    }: {
      value: number;
      feedback: string | null;
    }) => {
      alert(`${feedback}, ${value}`);
    },
    maxAllowedChars: 200,
    bottom: true,
  },
};

export default meta;
