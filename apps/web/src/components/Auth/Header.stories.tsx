import type { Meta, StoryObj } from "@storybook/react";
import Header from "@/components/Auth/Header";

type Component = typeof Header;

const meta: Meta<Component> = {
  title: "Auth/Header",
  component: Header,
};

export const Primary: StoryObj<Component> = {
  args: {},
};

export default meta;
