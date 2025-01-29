import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect } from "@/components/MultiSelect";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import { IDate } from "@litespace/types";
import { useState } from "react";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";
import { range } from "lodash";

type Component = typeof MultiSelect;

const meta: Meta<Component> = {
  title: "MultiSelect",
  component: MultiSelect,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {
  args: {
    placeholder: faker.color.human(),
    options: range(4).map((idx) => ({
      label: faker.color.human(),
      value: idx,
    })),
  },
  render(props) {
    const [values, setValues] = useState<IDate.Weekday[]>([]);
    return (
      <div>
        <MultiSelect
          {...props}
          values={values}
          setValues={(values) => setValues(values as IDate.Weekday[])}
        />
      </div>
    );
  },
};

export const ManyOptions: StoryObj<Component> = {
  args: {
    placeholder: faker.person.fullName(),
    values: [],
    options: range(100).map((idx) => ({
      label: faker.person.fullName(),
      value: idx,
    })),
  },
  render(props) {
    const [values, setValues] = useState<IDate.Weekday[]>([]);
    return (
      <div>
        <MultiSelect
          {...props}
          values={values}
          setValues={(values) => setValues(values as IDate.Weekday[])}
        />
      </div>
    );
  },
};

export const Error: StoryObj<Component> = {
  args: {
    placeholder: faker.person.fullName(),
    values: [],
    error: true,
    options: range(4).map((idx) => ({
      label: faker.person.fullName(),
      value: idx,
    })),
  },
};

export default meta;
