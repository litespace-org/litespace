import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import React from "react";
import { Direction } from "@/components/Direction";

type Component = typeof Button;

function wrap(props: object & { children: React.ReactNode }) {
  return (
    <div>
      <Button {...props}>{props.children}</Button>;
    </div>
  );
}

const meta: Meta<Component> = {
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    children: { control: "text" },
  },
  decorators: [
    (Story: React.FC) => {
      return (
        <Direction>
          <div className="ui-bg-background-200 ui-w-[30rem] ui-h-[30rem] ui-px-12 ui-flex ui-items-center ui-justify-center ui-shadow-xl ui-rounded-md">
            <Story />
          </div>
        </Direction>
      );
    },
  ],
};

export const Primary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
  },
};

export const PrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Primary,
    size: ButtonSize.Tiny,
  },
  render(props: object & { children: React.ReactNode }) {
    return (
      <div>
        <Button {...props}>{props.children}</Button>;
      </div>
    );
  },
};

export const PrimaryDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Primary,
    disabled: true,
  },
};

export const Secondary: StoryObj<Component> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Secondary,
  },
  render(props: object & { children: React.ReactNode }) {
    return <Button {...props}>{props.children}</Button>;
  },
};

export const SecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Secondary,
    size: ButtonSize.Tiny,
  },
  render: wrap,
};

export const SecondaryDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Secondary,
    disabled: true,
  },
};

export const Text: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Text,
  },
};

export const TextTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Text,
    size: ButtonSize.Tiny,
  },
  render: wrap,
};

export const TextDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Text,
    disabled: true,
  },
};

export const Error: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Error,
  },
};

export const ErrorTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.logout"],
    type: ButtonType.Error,
    size: ButtonSize.Tiny,
  },
  render: wrap,
};

export default meta;
