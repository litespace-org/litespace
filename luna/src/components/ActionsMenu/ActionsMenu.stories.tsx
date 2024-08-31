import type { Meta, StoryObj } from "@storybook/react";
import { ActionsMenu } from "@/components/ActionsMenu";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

type Component = typeof ActionsMenu;

const meta: Meta<Component> = {
  title: "ActionMenu",
  component: ActionsMenu,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    actions: [
      {
        id: 1,
        label: ar["page.login.form.button.submit.label"],
        onClick() {
          alert("Button clicked!!");
        },
      },
      {
        id: 2,
        label: ar["page.register.form.button.submit.label"],
        onClick() {
          alert("Button clicked!!");
        },
        disabled: true,
      },
      {
        id: 3,
        label: ar["global.labels.go"],
        onClick() {
          alert("Button clicked!!");
        },
        danger: true,
      },
    ],
  },
};

export default meta;
