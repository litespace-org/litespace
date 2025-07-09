import type { Meta, StoryObj } from "@storybook/react";
import { FullSwitch } from "@/components/Switch";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof FullSwitch;

const meta: Meta<Component> = {
  title: "FullSwitch",
  component: FullSwitch,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const PrimaryLarge: StoryObj<Component> = {
  args: {
    id: "switch",
    size: "large",
    title: faker.lorem.words(4),
    description: faker.lorem.words(10),
  },
};

export const PrimaryMedium: StoryObj<Component> = {
  args: {
    id: "switch",
    size: "medium",
    title: faker.lorem.words(4),
    description: faker.lorem.words(10),
  },
};

export const PrimarySmall: StoryObj<Component> = {
  args: {
    id: "switch",
    title: faker.lorem.words(4),
    description: faker.lorem.words(10),
  },
};

export const DisabledChecked: StoryObj<Component> = {
  args: { id: "switch", disabled: true, checked: true },
};

export const DisabledUnchecked: StoryObj<Component> = {
  args: { id: "switch", disabled: true, checked: false },
};

export default meta;
