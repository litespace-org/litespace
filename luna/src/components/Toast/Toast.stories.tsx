import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "@/components/Toast";
import React from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";

type Component = typeof Toast;

const meta: Meta<Component> = {
  title: "Toast",
  component: Toast,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="font-cairo text-foreground bg-dash-sidebar w-[900px] h-[600px] flex items-center justify-center">
          <Story />
        </div>
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<Component> = {
  args: {
    title: ar["page.error.title"],
    description: ar["errors.email.invlaid"],
    action: {
      onClick() {},
      label: ar["global.labels.gotit"],
    },
  },
};

export default meta;
