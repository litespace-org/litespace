import type { Meta, StoryObj } from "@storybook/react";
import { MonthlyCalendar } from "@/components/MonthlyCalendar/MonthlyCalendar";
import React from "react";
import dayjs from "@/lib/dayjs";

type Component = typeof MonthlyCalendar;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "MonthlyCalendar",
  component: MonthlyCalendar,
};

export const Primary: Story = {
  args: {},
  render(props) {
    return (
      <div className="w-[464px] mx-auto">
        <MonthlyCalendar {...props} />
      </div>
    );
  },
};

export const Selected: Story = {
  args: {
    selected: dayjs(),
  },
  render(props) {
    return (
      <div className="w-[464px] mx-auto">
        <MonthlyCalendar {...props} />
      </div>
    );
  },
};

export default meta;
