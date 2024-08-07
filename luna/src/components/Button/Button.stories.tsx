import type { Meta, StoryObj } from "@storybook/react";
import { Button, Color, Variant } from "@/components/Button";
import ar from "@/locales/ar-eg.json";

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    children: { control: "text" },
  },
};

export const FilledPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    variant: Variant.Filled,
    color: Color.Primary,
  },
};

export const FilledDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    variant: Variant.Filled,
    disabled: true,
  },
};

export const FilledError: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    variant: Variant.Filled,
    color: Color.Error,
  },
};

export const OutlinedPrimary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    variant: Variant.Outlined,
    color: Color.Primary,
  },
};

export const OutlineDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    variant: Variant.Outlined,
    disabled: true,
  },
};

export const OutlineError: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    variant: Variant.Outlined,
    color: Color.Error,
  },
};

export default meta;
