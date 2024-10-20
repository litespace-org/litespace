import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectList } from "@/components/Select";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type ISelect = typeof Select;

const meta: Meta<ISelect> = {
  title: "Select",
  component: Select,
  decorators: [DarkStoryWrapper],
};

const options: SelectList<string> = [
  { label: "الاختيار الاول", value: "1" },
  { label: "الاختيار الثاني", value: "2" },
  { label: "الاختيار الثالث", value: "3" },
  { label: "الاختيار الرابع", value: "4" },
];

export const Primary: StoryObj<ISelect> = {
  args: {
    placeholder: "ادخل سنه ميلادك",
    options,
    value: "3",
  },
};

export const WithDefaultValueSelected: StoryObj<ISelect> = {
  args: {
    options,
    value: "3",
    placeholder: "ادخل سنه ميلادك",
    onChange: (value) => console.log(value),
  },
};

export const ManyOptions: StoryObj<ISelect> = {
  args: {
    options: new Array(100)
      .fill(0)
      .map((_, idx) => ({ label: `Option ${idx + 1}`, value: idx })),
    value: "3",
    placeholder: "ادخل سنه ميلادك",
    onChange: (value) => console.log(value),
  },
};

export default meta;
