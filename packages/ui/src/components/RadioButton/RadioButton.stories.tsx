import { StoryObj, Meta } from "@storybook/react";
import { RadioButton } from "@/components/RadioButton";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof RadioButton> = {
  title: "RadioButton",
  component: RadioButton,
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof RadioButton>;

export const Primary: Story = {
  args: {
    label: <span>{faker.lorem.words(2)}</span>,
    name: "plan",
    onChange: () => {},
  },
};

export const MultiButtons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <RadioButton
        name="plan"
        label={<span>{faker.lorem.words(2)}</span>}
        onChange={() => {}}
      />
      <RadioButton
        name="plan"
        label={<span>{faker.lorem.words(2)}</span>}
        onChange={() => {}}
      />
      <RadioButton
        name="plan"
        label={<span>{faker.lorem.words(2)}</span>}
        onChange={() => {}}
      />
    </div>
  ),
};

export default meta;
