import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "@/components/Popover";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Button } from "@/components/Button";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Popover;

const meta: Meta<Component> = {
  title: "Popover",
  component: Popover,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    children: <Button>{faker.lorem.words(1)}</Button>,
    content: <p className="tw-w-full">{faker.lorem.words(3)}</p>,
  },
};

export default meta;
