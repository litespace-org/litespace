import React from "react";
import { Button } from "@/components/Button";
import Home from "@litespace/assets/Home";
import type { Meta, StoryObj } from "@storybook/react";
import { faker } from "@faker-js/faker/locale/ar";

type Component = typeof Button;

const meta: Meta<Component> = {
  title: "Button/Main/Secondary",
  component: Button,
  args: {
    children: faker.lorem.words({ min: 1, max: 4 }),
    size: "large",
    variant: "secondary",
    type: "main",
  },
  argTypes: {
    children: { control: "text" },
  },
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
