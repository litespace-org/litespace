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

const DialogComponent: React.FC<Props> = (props: Props) => {
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

const render = (props: Props) => {
  return <DialogComponent {...props} />;
};

export const Primary: Story = {
  args: {
    devices: {
      mic: true,
      camera: true,
      speakers: true,
    },
  },
  render,
};

export const EnablingMicAndCamera: Story = {
  args: {
    loading: "mic-and-camera",
    devices: {
      mic: true,
      camera: true,
      speakers: true,
    },
  },
  render,
};

export const EnablingMicOnly: Story = {
  args: {
    loading: "mic-only",
    devices: {
      mic: true,
      camera: true,
      speakers: true,
    },
  },
  render,
};

export const UserHasNoSpeakers: Story = {
  args: {
    devices: {
      mic: true,
      camera: true,
      speakers: false,
    },
  },
  render,
};

export const NoCameraAndMic: Story = {
  args: {
    devices: {
      mic: false,
      camera: false,
      speakers: true,
    },
  },
  render,
};

export const NoMicOnly: Story = {
  args: {
    devices: {
      mic: false,
      camera: true,
      speakers: true,
    },
  },
  render,
};

export const NoCameraOnly: Story = {
  args: {
    devices: {
      mic: true,
      camera: false,
      speakers: true,
    },
  },
  render,
};

export default meta;
