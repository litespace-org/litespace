import type { Meta, StoryObj } from "@storybook/react";
import { ActionsMenu } from "@/components/ActionsMenu";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

type Component = typeof ActionsMenu;

const meta: Meta<Component> = {
  title: "ActionMenu",
  component: ActionsMenu,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

const actions = [
  {
    id: 1,
    label: ar["page.login.form.button.submit.label"],
    onClick() {
      alert("Clicked 1!!");
    },
  },
  {
    id: 2,
    label: ar["page.register.form.button.submit.label"],
    onClick() {
      alert("Clicked 2!!");
    },
    disabled: true,
  },
  {
    id: 3,
    label: ar["global.labels.go"],
    onClick() {
      alert("Clicked 3!!");
    },
    danger: true,
  },
];

export const Primary: StoryObj<Component> = {
  args: { actions },
};

export const Small: StoryObj<Component> = {
  args: { actions, small: true },
};

export default meta;
