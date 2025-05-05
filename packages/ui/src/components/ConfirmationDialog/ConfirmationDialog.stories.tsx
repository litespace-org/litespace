import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import CheckCircle from "@litespace/assets/CheckCircle";
import React, { useEffect, useState } from "react";
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
    icon: <CheckCircle className="w-6 h-6" />,
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
    icon: <CheckCircle className="w-6 h-6" />,
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
    icon: <CheckCircle className="w-6 h-6" />,
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
    icon: <CheckCircle className="w-6 h-6" />,
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
    icon: <CheckCircle className="w-6 h-6" />,
  },
};

export const ProgressMain: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    progress: { value: 50, label: faker.lorem.words(3) },
    actions: {
      primary: { label: faker.lorem.word(), onClick: () => alert("primary") },
      secondary: {
        label: faker.lorem.word(),
        onClick: () => alert("secondary"),
      },
    },
    type: "main",
    icon: <CheckCircle className="w-6 h-6" />,
  },
};

export const ProgressError: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    progress: { value: 50, label: faker.lorem.words(3) },
    actions: {
      primary: { label: faker.lorem.word(), onClick: () => alert("primary") },
      secondary: {
        label: faker.lorem.word(),
        onClick: () => alert("secondary"),
      },
    },
    type: "error",
    icon: <CheckCircle className="w-6 h-6" />,
  },
};

export const ProgressDynamic: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    actions: {
      primary: { label: faker.lorem.word(), onClick: () => alert("primary") },
      secondary: {
        label: faker.lorem.word(),
        onClick: () => alert("secondary"),
      },
    },
    type: "main",
    icon: <CheckCircle className="w-6 h-6" />,
  },
  render(props) {
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
      const interval = setInterval(() => {
        if (progress >= 100) return setProgress(0);
        setProgress(progress + 5);
      }, 1_000);
      return () => {
        clearInterval(interval);
      };
    }, [progress]);

    return (
      <ConfirmationDialog
        {...props}
        progress={{ value: progress, label: faker.lorem.words(3) }}
      />
    );
  },
};

export const WithoutActions: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    description: faker.lorem.words(20),
    icon: <CheckCircle className="w-6 h-6" />,
  },
};

export const WithoutDescription: StoryObj<typeof ConfirmationDialog> = {
  args: {
    open: true,
    title: faker.lorem.words(5),
    icon: <CheckCircle className="w-6 h-6" />,
  },
};

export default meta;
