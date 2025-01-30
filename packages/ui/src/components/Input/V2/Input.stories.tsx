import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/Input/V2";
import React, { useState } from "react";
import { Direction } from "@/components/Direction";
import { faker } from "@faker-js/faker/locale/ar";
import Search from "@litespace/assets/Search";
import X from "@litespace/assets/X";

type Component = typeof Input;

const meta: Meta<Component> = {
  title: "Input/V2",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => {
      return (
        <Direction>
          <div className="tw-w-[30rem] tw-h-[30rem] tw-px-12 tw-flex tw-items-center tw-justify-center tw-shadow-xl tw-md">
            <Story />
          </div>
        </Direction>
      );
    },
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.internet.email(),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    icon: Search,
    endAction: {
      Icon: X,
      id: 1,
      onClick: () => alert("End Action"),
    },
  },
  render: (props) => {
    const [value, setValue] = useState<string>("");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Small: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.internet.email(),
    label: faker.lorem.words(2),
    inputSize: "small",
    helper: faker.lorem.words(2),
    icon: Search,
    endAction: {
      Icon: X,
      id: 1,
      onClick: () => alert("End Action"),
    },
  },
  render: (props) => {
    const [value, setValue] = useState<string>("");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Large: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.internet.email(),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    inputSize: "large",
    icon: Search,
    endAction: {
      Icon: X,
      id: 1,
      onClick: () => alert("End Action"),
    },
  },
  render: (props) => {
    const [value, setValue] = useState<string>("");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Filled: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.internet.email(),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    icon: Search,
    endAction: {
      Icon: X,
      id: 1,
      onClick: () => alert("End Action"),
    },
  },
  render: (props) => {
    const [value, setValue] = useState<string>("Hello, World!");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Error: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.internet.email(),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    state: "error",
    icon: Search,
    endAction: {
      Icon: X,
      id: 1,
      onClick: () => alert("End Action"),
    },
  },
  render: (props) => {
    const [value, setValue] = useState<string>("Error Value!");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const Disabled: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.internet.email(),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    disabled: true,
    icon: Search,
    endAction: {
      Icon: X,
      id: 1,
      onClick: () => alert("End Action"),
    },
  },
  render: (props) => {
    const [value, setValue] = useState<string>("");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export default meta;
