import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/Button";

const meta: Meta<typeof Button> = {
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
