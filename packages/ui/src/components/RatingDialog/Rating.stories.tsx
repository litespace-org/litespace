import { Meta, StoryObj } from "@storybook/react";
import RatingDialog from "@/components/RatingDialog";
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
    submit: (value: number, text?: string) => {
      alert(`${text}, ${value}`);
    },
    maxAllowedChars: 200,
  },
};

export default meta;
