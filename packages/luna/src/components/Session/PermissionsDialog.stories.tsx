import { StoryObj, Meta } from "@storybook/react";
import { PermissionsDialog } from "@/components/Session/PermissionsDialog";

type Component = typeof PermissionsDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Session/PermissionsDialog",
  component: PermissionsDialog,
};

export const Primary: Story = {
  args: {
    onSubmit(payload) {
      alert(`cam = ${payload.camera}, mic = ${payload.mic}`);
    },
  },
};

export const EnablingMicAndCamera: Story = {
  args: {
    onSubmit(payload) {
      alert(`cam = ${payload.camera}, mic = ${payload.mic}`);
    },
    loading: "mic-and-camera",
  },
};

export const EnablingMicOnly: Story = {
  args: {
    onSubmit(payload) {
      alert(`cam = ${payload.camera}, mic = ${payload.mic}`);
    },
    loading: "mic-only",
  },
};

export default meta;
