import { Meta, StoryObj } from "@storybook/react";
import SearchInput from "@/components/Navbar/SearchInput/SearchInput";
import React from "react";

const meta: Meta<typeof SearchInput> = {
  title: "Navbar/SearchInput",
  component: SearchInput,
  decorators: [
    (Story) => (
      <div className="tw-w-[386px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    onSearch(value: string) {
      alert(`Search for: ${value}`);
    },
  },
};
