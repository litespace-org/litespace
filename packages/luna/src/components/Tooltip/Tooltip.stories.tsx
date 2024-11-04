import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "@/components/Tooltip";
import ar from "@/locales/ar-eg.json";
import { PlusIcon } from "@radix-ui/react-icons";
import React from "react";

type Component = typeof Tooltip;

const meta: Meta<Component> = {
  title: "Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary: StoryObj<Component> = {
  args: {
    content: ar["global.notify.schedule.update.success"],
    children: (
      <button className="tw-inline-flex tw-size-[35px] tw-items-center tw-justify-center tw-rounded-full tw-bg-white tw-text-foreground tw-border">
        <PlusIcon />
      </button>
    ),
  },
};

export default meta;
