import { Meta, StoryObj } from "@storybook/react";
import { RatingDialog } from "@/components/RatingDialog";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof RatingDialog> = {
  title: "RatingDialog",
  component: RatingDialog,
};

type Story = StoryObj<typeof RatingDialog>;

const submit = ({
  value,
  feedback,
}: {
  value: number;
  feedback: string | null;
}) => {
  alert(`${feedback}, ${value}`);
};

export const Primary: Story = {
  args: {
    close: () => alert("close"),
    title: faker.lorem.words(2),
    header: faker.lorem.words(4),
    description: faker.lorem.words(20),
    submitting: false,
    maxAllowedCharacters: 200,
    submit,
  },
};

export const Skippable: Story = {
  args: {
    close: () => alert("close"),
    title: faker.lorem.words(2),
    header: faker.lorem.words(4),
    description: faker.lorem.words(20),
    submitting: false,
    maxAllowedCharacters: 200,
    skippable: true,
    submit,
  },
};

export const WithData: Story = {
  args: {
    close: () => alert("close"),
    title: faker.lorem.words(2),
    header: faker.lorem.words(4),
    description: faker.lorem.words(20),
    submitting: false,
    submit,
    initialFeedback: faker.lorem.words(20),
    initialRating: faker.number.int({ min: 1, max: 5 }),
    maxAllowedCharacters: 200,
  },
};

export const Submitting: Story = {
  args: {
    close: () => alert("close"),
    title: faker.lorem.words(2),
    header: faker.lorem.words(4),
    description: faker.lorem.words(20),
    submitting: true,
    initialFeedback: faker.lorem.words(20),
    initialRating: faker.number.int({ min: 1, max: 5 }),
    maxAllowedCharacters: 200,
    submit,
  },
};

export default meta;
