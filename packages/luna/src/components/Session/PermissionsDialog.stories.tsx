import { StoryObj, Meta } from "@storybook/react";
import {
  PermissionsDialog,
  Props,
} from "@/components/Session/PermissionsDialog";
import { useState } from "react";
import React from "react";

type Component = typeof PermissionsDialog;
type Story = StoryObj<Component>;

const meta: Meta<Component> = {
  title: "Session/PermissionsDialog",
  component: PermissionsDialog,
};

const render = (props: Props) => {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      <PermissionsDialog
        {...props}
        open={open}
        onSubmit={(permission) => {
          alert(permission);
          setOpen(false);
        }}
      />
    </div>
  );
};

export const Primary: Story = {
  args: {},
  render,
};

export const EnablingMicAndCamera: Story = {
  args: {
    loading: "mic-and-camera",
  },
  render,
};

export const EnablingMicOnly: Story = {
  args: {
    loading: "mic-only",
  },
  render,
};

export default meta;
