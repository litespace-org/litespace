import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "@/components/Popover";
import { DrarkWrapper } from "@/Internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";
import { Button } from "../Button";

type Component = typeof Popover;

const meta: Meta<Component> = {
  title: "Popover",
  component: Popover,
  parameters: { layout: "centered" },
  decorators: [DrarkWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    children: <Button>{ar["global.labels.go"]}</Button>,
    content: (
      <p className="w-full">
        {ar["page.tutor.onboarding.book.interview.success.title"]}
      </p>
    ),
  },
};

export default meta;
