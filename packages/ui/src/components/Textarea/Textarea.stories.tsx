import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Textarea } from "@/components/Textarea/Textarea";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Textarea;

const meta: Meta<Component> = {
  title: "Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="tw-w-[500px]">
        <Story className="tw-h-[138px]" />
      </div>
    ),
  ],
};

export const PrimaryInteractive: StoryObj<Component> = {
  args: {
    label: faker.lorem.words(2),
    placeholder: faker.lorem.words(2),
    maxAllowedCharacters: 180,
  },
  render(props) {
    const [value, setValue] = useState<string>("");
    return (
      <Textarea
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const WithMaxNum: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    maxLength: 400,
  },
};

export const WithHelperText: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(4),
  },
};

export const WithMaxAllowedCharactersPrimary: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(4),
    maxAllowedCharacters: 180,
  },
};

export const WithMaxAllowedCharactersSuccess: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(4),
    maxAllowedCharacters: 180,
    state: "success",
  },
};

export const WithMaxAllowedCharactersError: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(4),
    maxAllowedCharacters: 180,
    state: "error",
  },
};

export const WithMaxAllowedCharactersDisabled: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    label: faker.lorem.words(2),
    helper: faker.lorem.words(4),
    maxAllowedCharacters: 180,
    disabled: true,
  },
};

export const Success: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    label: faker.lorem.words(2),
    state: "success",
  },
};

export const Error: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    label: faker.lorem.words(2),
    state: "error",
  },
};

export const Disabled: StoryObj<Component> = {
  args: {
    label: faker.lorem.words(2),
    placeholder: faker.lorem.words(2),
    disabled: true,
  },
};

export default meta;
