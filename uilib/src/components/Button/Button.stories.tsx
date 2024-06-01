import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/Button";

const meta: Meta<typeof Button> = {
  title: "Button 1",
  component: Button,
  argTypes: {
    children: { control: "text" },
  },
};

export const Primary: StoryObj<typeof Button> = {
  args: {
    children: "Button",
  },
};

export default meta;
