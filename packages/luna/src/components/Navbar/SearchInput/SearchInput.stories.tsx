import { Meta, StoryObj } from "@storybook/react";
import SearchInput from "@/components/Navbar/SearchInput/SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Navbar/SearchInput",
  component: SearchInput,
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {},
};
