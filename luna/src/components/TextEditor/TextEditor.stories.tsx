import type { Meta, StoryObj } from "@storybook/react";
import { TextEditor } from "@/components/TextEditor";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

const meta: Meta<typeof TextEditor> = {
  title: "Text Editor",
  component: TextEditor,
  parameters: {
    layout: "centered",
  },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<typeof TextEditor> = {
  args: {},
};

export const Errored: StoryObj<typeof TextEditor> = {
  args: {
    error: ar["error.email.invlaid"],
  },
};

export default meta;
