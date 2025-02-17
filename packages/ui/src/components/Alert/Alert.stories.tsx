import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "@/components/Alert";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Alert;

const meta: Meta<Component> = {
  title: "Alert",
  component: Alert,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    title: faker.lorem.words(4),
    children: faker.lorem.words(4),
    action: {
      label: faker.lorem.words(4),
    },
  },
};

export const ErrorTitleOnly: StoryObj<Component> = {
  args: {
    title: faker.lorem.words(4),
  },
};

export const ErrorDescriptionOnly: StoryObj<Component> = {
  args: {
    children: faker.lorem.words(4),
  },
};

export const ErrorLoading: StoryObj<Component> = {
  args: {
    title: faker.lorem.words(4),
    children: faker.lorem.words(4),
    action: {
      label: faker.lorem.words(4),
      loading: true,
    },
  },
};

export const ErrrorDisalbed: StoryObj<Component> = {
  args: {
    title: faker.lorem.words(4),
    children: faker.lorem.words(4),
    action: {
      label: faker.lorem.words(4),
      disabled: true,
    },
  },
};

export default meta;
