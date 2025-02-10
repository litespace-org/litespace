import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import CheckCircle from "@litespace/assets/CheckCircle";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

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
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    type: "success",
    icon: <CheckCircle />,
  },
};

export const PrimaryButtonOnly: StoryObj<typeof ConfirmationDialog> = {
  args: {
    trigger: <button>Success</button>,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    type: "success",
    icon: <CheckCircle />,
  },
};

export const Warnning: StoryObj<typeof ConfirmationDialog> = {
  args: {
    trigger: <button>Warning</button>,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    type: "warning",
    icon: <CheckCircle />,
  },
};

export const Error: StoryObj<typeof ConfirmationDialog> = {
  args: {
    trigger: <button>Error</button>,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    actions: {},
    type: "error",
    icon: <CheckCircle />,
  },
};

export default meta;
