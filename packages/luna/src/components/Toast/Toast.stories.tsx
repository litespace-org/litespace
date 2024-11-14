import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "@/components/Toast/Toast";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import { Direction } from "@/components/Direction";
import { ToastProvider, useToast } from "@/components/Toast";

type Component = typeof Toast;

const meta: Meta<Component> = {
  title: "Toast",
  component: Toast,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Success: StoryObj<Component> = {
  args: {
    title: ar["dashboard.error.alert.title"],
    description: ar["error.unexpected"],
  },
  render() {
    const toast = useToast();
    const showToast = useCallback(() => {
      toast.success({
        title: "Saved Successfully",
        description: "This is a good sign that you have succeeded",
      });
    }, [toast]);
    return (
      <Direction>
        <ToastProvider>
          <Button onClick={showToast}>Open</Button>
        </ToastProvider>
      </Direction>
    );
  },
};

export const Warning: StoryObj<Component> = {
  args: {
    title: ar["dashboard.error.alert.title"],
    description: ar["error.unexpected"],
  },
  render() {
    const toast = useToast();
    const showToast = useCallback(() => {
      toast.warning({
        title: "Are you sure man",
        description: "please reconsider your choices quickly",
      });
    }, [toast]);
    return (
      <Direction>
        <Button onClick={showToast}>Open</Button>
      </Direction>
    );
  },
};

export const Error: StoryObj<Component> = {
  args: {
    title: ar["dashboard.error.alert.title"],
    description: ar["error.unexpected"],
  },
  render() {
    const toast = useToast();
    const showToast = useCallback(() => {
      toast.error({
        title: "Couldn't Connect to Server",
        description: "Help Me, I can't connect to the server",
      });
    }, [toast]);
    return (
      <Direction>
        <ToastProvider>
          <Button onClick={showToast}>Open</Button>
        </ToastProvider>
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
