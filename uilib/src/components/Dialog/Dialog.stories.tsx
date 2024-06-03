import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "@/components/Dialog";

const meta: Meta<typeof Dialog> = {
  title: "Dialog",
  component: Dialog,
};

export const Primary: StoryObj<typeof Dialog> = {
  args: {
    trigger: "Open",
    children: <div>Hello!!</div>,
    title: "My Profile",
  },
};

export default meta;
