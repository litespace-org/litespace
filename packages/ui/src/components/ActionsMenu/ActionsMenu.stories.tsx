import type { Meta, StoryObj } from "@storybook/react";
import { ActionsMenu } from "@/components/ActionsMenu";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";

type Component = typeof ActionsMenu;

const meta: Meta<Component> = {
  title: "ActionMenu",
  component: ActionsMenu,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

const actions = [
  {
    id: 1,
    label: ar["labels.share"],
    onClick() {
      alert("Clicked 1!!");
    },
  },
  {
    id: 2,
    label: ar["labels.go-back"],
    onClick() {
      alert("Clicked 2!!");
    },
    disabled: true,
  },
  {
    id: 3,
    label: ar["global.labels.go"],
    onClick() {
      alert("Clicked 3!!");
    },
    danger: true,
  },
];

export const Primary: StoryObj<Component> = {
  args: { actions },
};

export const Small: StoryObj<Component> = {
  args: { actions, small: true },
};

export const SubActions: StoryObj<Component> = {
  args: {
    actions: [
      ...actions,
      {
        id: 4,
        label: ar["invoices.method.bank"],
        subActions: [
          {
            id: 5,
            label: ar["banks.labels.alex"],
            checked: false,
          },
          {
            id: 6,
            label: ar["banks.labels.cib"],
            checked: true,
          },
        ],
      },
    ],
  },
};

export const RadioGroup: StoryObj<Component> = {
  args: {
    actions: [
      ...actions,
      {
        id: 4,
        label: ar["invoices.method.bank"],
        radioGroup: [
          {
            id: 5,
            label: ar["banks.labels.alex"],
            value: "alex",
          },
          {
            id: 6,
            label: ar["banks.labels.cib"],
            value: "cib",
          },
        ],
        value: "alex",
      },
    ],
  },
};

export default meta;
