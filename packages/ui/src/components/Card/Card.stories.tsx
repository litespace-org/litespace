import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/components/Card";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Card;

const meta: Meta<Component> = {
  title: "Card",
  component: Card,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    children: faker.lorem.paragraphs(5),
  },
};

export default meta;
