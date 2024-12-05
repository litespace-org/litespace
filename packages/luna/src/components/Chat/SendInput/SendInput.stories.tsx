import type { Meta, StoryObj } from "@storybook/react";
import { SendInput } from "@/components/Chat/SendInput";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof SendInput;

const meta: Meta<Component> = {
  component: SendInput,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    onSubmit: () => {},
  },
};

export const PrimaryWithInitial: StoryObj<Component> = {
  args: {
    onSubmit: () => {},
    initialMessage: { text: faker.lorem.words(10), id: 5 },
  },
};

export default meta;
