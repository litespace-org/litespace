import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "@/components/Toast/Toast";
import React, { useState } from "react";
import { Button } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import { Direction } from "@/components/Direction";
import { ToastProvider } from "@/components/Toast/provider";

type Component = typeof Toast;

const meta: Meta<Component> = {
  title: "Toast",
  component: Toast,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary: StoryObj<Component> = {
  args: {
    title: ar["dashboard.error.alert.title"],
    description: ar["error.unexpected"],
  },
  render(props) {
    const [open, setOpen] = useState<boolean>(false);
    return (
      <Direction>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Toast {...props} open={open} onOpenChange={setOpen} />
      </Direction>
    );
  },
};

export const MultiToast: StoryObj<Component> = {
  args: {
    title: ar["dashboard.error.alert.title"],
    description: ar["error.unexpected"],
  },
  render(props) {
    const [open, setOpen] = useState<boolean>(false);
    return (
      <Direction>
        <ToastProvider>
          <Button onClick={() => setOpen(true)}>Open</Button>
          <Toast {...props} key={1} open={open} onOpenChange={setOpen} />
          <Toast {...props} key={2} open={open} onOpenChange={setOpen} />
        </ToastProvider>
      </Direction>
    );
  },
};

export default meta;
