import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import CheckCircle from "@litespace/assets/CheckCircle";
import React from "react";
import { faker } from "@faker-js/faker/locale/ar";

const meta: Meta<typeof ConfirmationDialog> = {
  title: "Confirmation Dialog",
  component: ConfirmationDialog,
};

export const Primary: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    icon: <CheckCircle />,
    actions: {
      primary: { label: faker.lorem.word(), onClick: () => alert("primary") },
    },
  },
};

export const WithSecondaryAction: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    type: "main",
    icon: <CheckCircle />,
    actions: {
      primary: { label: faker.lorem.word(), onClick: () => alert("primary") },
      secondary: {
        label: faker.lorem.word(),
        onClick: () => alert("secondary"),
      },
    },
  },
};

export const Warnning: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    type: "warning",
    icon: <CheckCircle />,
    actions: {
      primary: { label: faker.lorem.word(), onClick: () => alert("primary") },
      secondary: {
        label: faker.lorem.word(),
        onClick: () => alert("secondary"),
      },
    },
  },
};

export const Error: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    actions: {
      primary: { label: faker.lorem.word(), onClick: () => alert("primary") },
      secondary: {
        label: faker.lorem.word(),
        onClick: () => alert("secondary"),
      },
    },
    type: "error",
    icon: <CheckCircle />,
  },
};

export const Loading: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    actions: {
      primary: {
        label: faker.lorem.word(),
        onClick: () => alert("primary"),
        loading: true,
        disabled: true,
      },
      secondary: {
        label: faker.lorem.word(),
        onClick: () => alert("secondary"),
        loading: true,
        disabled: true,
      },
    },
    type: "error",
    icon: <CheckCircle />,
  },
};

export default meta;
