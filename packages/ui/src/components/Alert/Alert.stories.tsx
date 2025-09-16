import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertType } from "@/components/Alert";
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
    title: faker.lorem.words(5),
    children: faker.lorem.paragraph(),
    action: {
      label: faker.lorem.word(),
    },
  },
};

export const ErrorTitleOnly: StoryObj<Component> = {
  args: {
    title: faker.lorem.words(5),
  },
};

export const ErrorDescriptionOnly: StoryObj<Component> = {
  args: {
    children: faker.lorem.words(5),
  },
};

export const Info: StoryObj<Component> = {
  args: {
    children: faker.lorem.words(5),
    type: AlertType.Info,
  },
};

export const Success: StoryObj<Component> = {
  args: {
    children: faker.lorem.words(5),
    type: AlertType.Success,
  },
};

export const Warning: StoryObj<Component> = {
  args: {
    children: faker.lorem.words(5),
    type: AlertType.Warning,
  },
};

export default meta;
