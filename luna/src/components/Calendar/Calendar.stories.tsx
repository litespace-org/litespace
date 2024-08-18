import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "@/components/Calendar";
import { Direction } from "@/components/Direction";

type Component = typeof Calendar;

const meta: Meta<Component> = {
  title: "Calendar",
  component: Calendar,
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="font-cairo text-foreground bg-dash-sidebar w-full min-h-screen">
          <Story />
        </div>
      </Direction>
    ),
  ],
};

export const Primary = {};

export default meta;
