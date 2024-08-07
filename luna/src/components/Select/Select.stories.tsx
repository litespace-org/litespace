import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "@/components/Select";
import { Direction, Dir } from "@/components/Direction";
import React from "react";

type ISelect = typeof Select;

const meta: Meta<ISelect> = {
  component: Select,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <Story />
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<ISelect> = {
  args: {
    dir: Dir.RTL,
    placeholder: "ادخل سنه ميلادك",
  },
};

export default meta;
