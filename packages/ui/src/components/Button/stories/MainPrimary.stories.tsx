import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/Button";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import Home from "@litespace/assets/Home";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Button;

const meta: Meta<Component> = {
  title: "Button/Main/Primary",
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
    variant: "primary",
    size: "small",
  },
};

export const Medium: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "primary",
    size: "medium",
  },
};

export const Large: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "primary",
    size: "large",
  },
};

export const Disabled: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "primary",
    size: "small",
    disabled: true,
  },
};

export const Loading: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    type: "main",
    variant: "primary",
    size: "small",
    loading: true,
  },
};

export const WithStartIcon: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    startIcon: <Home className="icon" />,
    type: "main",
    variant: "primary",
    size: "large",
  },
};

export const WithEndIcon: StoryObj<typeof Button> = {
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    endIcon: <Home className="icon" />,
    type: "main",
    variant: "primary",
    size: "large",
  },
};

export const WithOnlyIcon: StoryObj<typeof Button> = {
  args: {
    endIcon: <Home className="icon" />,
    type: "main",
    variant: "primary",
    size: "large",
  },
};

export default meta;
