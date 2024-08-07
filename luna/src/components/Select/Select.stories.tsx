import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectList } from "@/components/Select";
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

const list: SelectList = [
  { label: "الاختيار الاول", value: "1" },
  { label: "الاختيار الثاني", value: "2" },
  { label: "الاختيار الثالث", value: "3" },
  { label: "الاختيار الرابع", value: "4" },
];

export const Primary: StoryObj<ISelect> = {
  args: {
    dir: Dir.RTL,
    placeholder: "ادخل سنه ميلادك",
    list,
  },
};

export const WithDefaultValueSelected: StoryObj<ISelect> = {
  args: {
    list,
    value: "3",
    dir: Dir.RTL,
    placeholder: "ادخل سنه ميلادك",
    onChange: (value: string) => console.log(value),
  },
};

export default meta;
