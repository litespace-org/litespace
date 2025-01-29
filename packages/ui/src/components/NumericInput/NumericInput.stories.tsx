import type { Meta, StoryObj } from "@storybook/react";
import { NumericInput } from "@/components/NumericInput";

type Component = typeof NumericInput;

const meta: Meta<Component> = {
  title: "Numeric Input",
  component: NumericInput,
  parameters: { layout: "centered" },
};

export const Primary: StoryObj<Component> = {
  args: {},
};

export default meta;
