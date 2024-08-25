import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "@/components/Accordion";
import { DrarkWrapper } from "@/Internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

type Component = typeof Accordion;

const meta: Meta<Component> = {
  title: "Accordion",
  component: Accordion,
  parameters: { layout: "centered" },
  decorators: [DrarkWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    items: [
      {
        id: 1,
        trigger: ar["global.form.email.label"],
        content: ar["error.required"],
      },
      {
        id: 2,
        trigger: ar["global.form.password.label"],
        content: ar["error.required"],
      },
    ],
    open: 1,
  },
};

export default meta;
