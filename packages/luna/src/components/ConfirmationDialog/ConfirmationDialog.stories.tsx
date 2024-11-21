import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import React from "react";
import { DialogType } from "./types";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "Confirmation Dialog",
  component: ConfirmationDialog,
  decorators: [
    (Story: React.FC) => (
      <div className="tw-font-cairo tw-text-foreground tw-bg-dash-sidebar tw-w-full tw-min-h-screen tw-px-10 tw-py-10">
        <Story />
      </div>
    ),
  ],
};

export const Success: StoryObj<typeof ConfirmationDialog> = {
  args: {
    trigger: <button>Success</button>,
    title: "Lesson has been booked",
    type: DialogType.Success,
    description:
      "The lesson has been booked. You can reschedule the lesson date up to two days before the lesson date ",
  },
};

export const Save: StoryObj<typeof ConfirmationDialog> = {
  args: {
    trigger: <button>Save</button>,
    title: "Lesson has been booked",
    type: DialogType.Save,
    description:
      "The lesson has been booked. You can reschedule the lesson date up to two days before the lesson date ",
  },
};

export const EndCall: StoryObj<typeof ConfirmationDialog> = {
  args: {
    trigger: <button>End Call</button>,
    title: "Lesson has been booked",
    type: DialogType.EndCall,
    description:
      "The lesson has been booked. You can reschedule the lesson date up to two days before the lesson date ",
  },
};

export default meta;
