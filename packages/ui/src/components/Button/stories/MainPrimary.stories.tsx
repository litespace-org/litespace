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
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    size: "large",
    variant: "primary",
    type: "main",
  },
  argTypes: {
    children: { control: "text" },
  },
  decorators: [DarkStoryWrapper],
};

type Story = StoryObj<Component>;

export const Small: Story = {
  render: (args) => <Button {...args} size="small" />,
};

export const Medium: Story = {
  render: (args) => <Button {...args} size="medium" />,
};

export const Large: Story = {
  render: (args) => <Button {...args} />,
};

export const Disabled: Story = {
  render: (args) => <Button {...args} disabled />,
};

export const Loading: Story = {
  render: (args) => <Button {...args} loading />,
};

export const WithStartIcon: Story = {
  render: (args) => <Button {...args} startIcon={<Home className="icon" />} />,
};

export const WithEndIcon: Story = {
  render: (args) => <Button {...args} endIcon={<Home className="icon" />} />,
};

export const WithOnlyIcon: Story = {
  render: (args) => (
    <Button {...args} children={null} endIcon={<Home className="icon" />} />
  ),
};

export default meta;
