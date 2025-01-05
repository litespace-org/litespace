import { StoryObj, Meta } from "@storybook/react";
import { ShareScreenDialog } from "@/components/Session/ShareScreenDialog";

type Component = typeof ShareScreenDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Session/ShareScreenDialog",
  component: ShareScreenDialog,
  parameters: { layout: "centered" },
};

export const Primary: Story = {
  args: {
    open: true,
  },
};

export default meta;
