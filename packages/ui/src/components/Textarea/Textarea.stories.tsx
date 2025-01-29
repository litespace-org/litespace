import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
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
        <Story />
      </div>
    ),
  ],
};

export const PrimaryInteractive: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
  },
};

export const WithHelperText: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    helper: faker.lorem.words(4),
  },
};

export const Error: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    helper: faker.lorem.words(2),
    error: true,
  },
};

export const Disabled: StoryObj<Component> = {
  args: {
    placeholder: faker.lorem.words(2),
    disabled: true,
  },
};

export default meta;
