import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "@/components/Alert";
import ar from "@/locales/ar-eg.json";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";

type Component = typeof Alert;

const meta: Meta<Component> = {
  title: "Alert",
  component: Alert,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    title: ar["global.notify.schedule.update.success"],
    description: ar["page.tutor.onboarding.steps.third.description"],
    action: {
      label: ar["page.schedule.list.actions.delete"],
    },
  },
};

export const ErrorTitleOnly: StoryObj<Component> = {
  args: {
    title: ar["global.notify.schedule.update.success"],
  },
};

export const ErrorDescriptionOnly: StoryObj<Component> = {
  args: {
    description: ar["page.tutor.onboarding.steps.third.description"],
  },
};

export const ErrorLoading: StoryObj<Component> = {
  args: {
    title: ar["global.notify.schedule.update.success"],
    description: ar["page.tutor.onboarding.steps.third.description"],
    action: {
      label: ar["page.schedule.list.actions.delete"],
      loading: true,
    },
  },
};

export const ErrrorDisalbed: StoryObj<Component> = {
  args: {
    title: ar["global.notify.schedule.update.success"],
    description: ar["page.tutor.onboarding.steps.third.description"],
    action: {
      label: ar["page.schedule.list.actions.delete"],
      disabled: true,
    },
  },
};

export default meta;
