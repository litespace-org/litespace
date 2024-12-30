import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectList } from "@/components/Select";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

type ISelect = typeof Select;

const meta: Meta<ISelect> = {
  title: "Select",
  component: Select,
  decorators: [DarkStoryWrapper],
};

const options: SelectList<number> = range(5).map((idx) => ({
  label: faker.color.human(),
  value: idx,
}));

export const Primary: StoryObj<ISelect> = {
  args: {
    placeholder: faker.lorem.words(5),
    options,
  },
};

export const WithDefaultValueSelected: StoryObj<ISelect> = {
  args: {
    options,
    placeholder: faker.lorem.words(5),
    onChange: (value) => console.log(value),
  },
};

export const EmptyOptions: StoryObj<ISelect> = {
  args: {
    options: [],
    placeholder: faker.lorem.words(5),
    onChange: (value) => console.log(value),
  },
};

export const ManyOptions: StoryObj<ISelect> = {
  args: {
    options: range(100).map((_, idx) => ({
      label: faker.person.fullName(),
      value: idx,
    })),
    placeholder: faker.lorem.words(3),
    onChange: (value) => console.log(value),
  },
};

export default meta;
