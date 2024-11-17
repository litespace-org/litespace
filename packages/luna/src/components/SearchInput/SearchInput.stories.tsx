import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "@/components/SearchInput/";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof SearchInput;

const meta: Meta<Component> = {
  title: "SearchInput",
  component: SearchInput,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<Component> = {};

export default meta;
