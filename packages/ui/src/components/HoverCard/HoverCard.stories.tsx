import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard } from "@/components/HoverCard";
import ar from "@/locales/ar-eg.json";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";

type Component = typeof HoverCard;

const meta: Meta<Component> = {
  title: "HoverCard",
  component: HoverCard,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary: StoryObj<Component> = {
  args: {
    content: ar["global.notify.schedule.update.success"],
    children: (
      <button className="inline-flex size-[35px] items-center justify-center rounded-full bg-white text-foreground border">
        <PlusIcon />
      </button>
    ),
  },
};

export default meta;
