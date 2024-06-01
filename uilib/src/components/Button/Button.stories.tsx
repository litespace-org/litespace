import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
  title: "Button 1",
  component: Button,
  argTypes: {
    children: { control: "text" },
  },
};

export const Primary: Story = {
  args: {
    children: "Button",
  },
};

export default meta;
