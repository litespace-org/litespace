import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard } from "@/components/HoverCard";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof HoverCard;

const meta: Meta<Component> = {
  title: "HoverCard",
  component: HoverCard,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary: StoryObj<Component> = {
  args: {
    content: faker.lorem.words(4),
    children: (
      <button className="tw-inline-flex tw-size-[35px] tw-items-center tw-justify-center tw-rounded-full tw-bg-white tw-text-foreground tw-border">
        <PlusIcon />
      </button>
    ),
  },
};

export default meta;
