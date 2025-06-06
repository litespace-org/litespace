import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "@/components/Popover";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { Button } from "@/components/Button";
import React from "react";
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
    children: <Button>Hover over me</Button>,
    content: <p className="w-full">{faker.lorem.paragraph()}</p>,
  },
};

export default meta;
