import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectList, SelectProps } from "@/components/Select";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";
import { useState } from "react";
import React from "react";

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

const render = (props: SelectProps<string | number>) => {
  const [value, setValue] = useState<string | number | undefined>(props.value);
  return <Select {...props} value={value} onChange={setValue} />;
};

export const Primary: StoryObj<ISelect> = {
  args: {
    label: faker.lorem.words(3),
    placeholder: faker.lorem.words(5),
    helper: faker.lorem.words(5),
    options,
  },
  render,
};

export const Small: StoryObj<ISelect> = {
  args: {
    label: faker.lorem.words(3),
    placeholder: faker.lorem.words(5),
    helper: faker.lorem.words(5),
    options,
    size: "small",
  },
  render,
};

export const Meidum: StoryObj<ISelect> = {
  args: {
    label: faker.lorem.words(3),
    placeholder: faker.lorem.words(5),
    helper: faker.lorem.words(5),
    options,
    size: "medium",
  },
  render,
};

export const Large: StoryObj<ISelect> = {
  args: {
    label: faker.lorem.words(3),
    placeholder: faker.lorem.words(5),
    helper: faker.lorem.words(5),
    options,
    size: "large",
  },
  render,
};

export const WithoutTitle: StoryObj<ISelect> = {
  args: {
    placeholder: faker.lorem.words(5),
    helper: faker.lorem.words(5),
    options,
  },
  render,
};

export const WithoutHelper: StoryObj<ISelect> = {
  args: {
    label: faker.lorem.words(3),
    placeholder: faker.lorem.words(5),
    options,
  },
  render,
};

export const WithoutDropdownIcon: StoryObj<ISelect> = {
  args: {
    options,
    placeholder: faker.lorem.words(3),
    onChange: (value) => console.log(value),
    showDropdownIcon: false,
  },
  render,
};

export const WithDefaultValueSelected: StoryObj<ISelect> = {
  args: {
    options,
    value: options[1].value,
    placeholder: faker.lorem.words(5),
    onChange: (value) => console.log(value),
  },
  render,
};

export const EmptyOptions: StoryObj<ISelect> = {
  args: {
    options: [],
    placeholder: faker.lorem.words(5),
    onChange: (value) => console.log(value),
  },
  render,
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
  render,
};

export default meta;
