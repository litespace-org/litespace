import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/Button";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import Home from "@litespace/assets/Home";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Button;

const meta: Meta<Component> = {
  title: "Button/Main/Tertiary",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    children: { control: "text" },
  },
  decorators: [DarkStoryWrapper],
};

export const Small: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "tertiary",
    size: "small",
  },
};

export const Medium: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "tertiary",
    size: "medium",
  },
};

export const Large: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "tertiary",
    size: "large",
  },
};

export const Disabled: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "tertiary",
    size: "small",
    disabled: true,
  },
};

export const Loading: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "tertiary",
    size: "large",
    loading: true,
  },
};

export const WithStartIcon: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    startIcon: <Home className="icon" />,
    type: "main",
    variant: "tertiary",
    size: "small",
  },
};

export const WithEndIcon: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    endIcon: <Home className="icon" />,
    type: "main",
    variant: "tertiary",
    size: "small",
  },
};

export const WithOnlyIcon: StoryObj<typeof Button> = {
  args: {
    endIcon: <Home className="icon" />,
    type: "main",
    variant: "tertiary",
    size: "small",
  },
};

export default meta;
