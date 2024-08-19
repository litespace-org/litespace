import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectList } from "@/components/Select";
import { Direction, Dir } from "@/components/Direction";
import React from "react";

type ISelect = typeof Select;

const meta: Meta<ISelect> = {
  title: "Select",
  component: Select,
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="bg-dash-sidebar w-full min-h-screen flex justify-center items-center font-cairo">
          <div className="w-[500px]">
            <Story />
          </div>
        </div>
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
