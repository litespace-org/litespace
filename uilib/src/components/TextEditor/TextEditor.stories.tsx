import type { Meta, StoryObj } from "@storybook/react";
import { TextEditor } from "@/components/TextEditor";

const meta: Meta<typeof TextEditor> = {
  title: "Text Editor",
  component: TextEditor,
  //   parameters: {
  //     layout: "centered",
  //   },
};

export const Primary: StoryObj<typeof TextEditor> = {
  args: {},
};

export default meta;
