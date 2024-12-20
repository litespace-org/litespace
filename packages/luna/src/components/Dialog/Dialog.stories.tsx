import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "@/components/Dialog";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import React from "react";

const meta: Meta<typeof Dialog> = {
  title: "Dialog/V1",
  component: Dialog,
  decorators: [
    (Story: React.FC) => (
      <Direction>
        <div className="tw-font-cairo tw-text-foreground tw-bg-dash-sidebar tw-w-full tw-min-h-screen tw-px-10 tw-py-10">
          <Story />
        </div>
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<typeof Dialog> = {
  args: {
    trigger: <button>trigger</button>,
    children: (
      <div className="tw-text-foreground-light">
        {ar["error.tutor.bio.arabic.only"]}
      </div>
    ),
    title: ar["error.update.data"],
    description: "hello",
  },
};

export const WithoutTrigger: StoryObj<typeof Dialog> = {
  args: {
    open: true,
    children: (
      <div className="tw-text-foreground-light">
        {ar["error.tutor.bio.arabic.only"]}
      </div>
    ),
    title: ar["error.update.data"],
    description: "hello",
  },
};

export default meta;
