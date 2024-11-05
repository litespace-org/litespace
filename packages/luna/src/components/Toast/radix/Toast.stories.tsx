import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "@/components/Toast/radix/Toast";
import React, { useState } from "react";
import { Button } from "@/components/Button";
// import ar from "@/locales/ar-eg.json";

type Component = typeof Toast;

const meta: Meta<Component> = {
  title: "Radix Toast",
  component: Toast,
  parameters: { layout: "centered" },
  decorators: [],
};

export const Primary: StoryObj<Component> = {
  args: {
    title: "Toast title",
    description: "This is the toast description",
  },
  render(props) {
    const [open, setOpen] = useState<boolean>(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Toast {...props} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};

export default meta;
