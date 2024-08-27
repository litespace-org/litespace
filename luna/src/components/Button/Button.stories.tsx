import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import React from "react";
import { DarkStoryWrapper } from "@/Internal/DarkWrapper";

type Component = typeof Button;

const meta: Meta<Component> = {
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    children: { control: "text" },
  },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
  },
};

export const PrimaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Primary,
    size: ButtonSize.Tiny,
  },
  render(props: object & { children: React.ReactNode }) {
    return (
      <div>
        <Button {...props}>{props.children}</Button>
      </div>
    );
  },
};

export const PrimaryLoading: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    loading: true,
  },
};

export const PrimaryDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Primary,
    disabled: true,
  },
};

export const Secondary: StoryObj<Component> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Secondary,
  },
  render(props: object & { children: React.ReactNode }) {
    return <Button {...props}>{props.children}</Button>;
  },
};

export const SecondaryLoading: StoryObj<Component> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Secondary,
    loading: true,
  },
  render(props: object & { children: React.ReactNode }) {
    return <Button {...props}>{props.children}</Button>;
  },
};

export const SecondaryTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Secondary,
    size: ButtonSize.Tiny,
  },
};

export const SecondaryDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Secondary,
    disabled: true,
  },
};

export const Text: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Text,
  },
};

export const TextTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Text,
    size: ButtonSize.Tiny,
  },
};

export const TextDisabled: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Text,
    disabled: true,
  },
};

export const Error: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
  },
};

export const ErrorTiny: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    size: ButtonSize.Tiny,
  },
};

export const ErrorLoading: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Error,
    loading: true,
  },
};

export const LoadingOverHiddenText: StoryObj<typeof Button> = {
  args: {
    children: ar["global.labels.logout"],
    type: ButtonType.Primary,
    size: ButtonSize.Tiny,
    loading: true,
  },
  render(props: object & { children: React.ReactNode }) {
    return (
      <div>
        <Button {...props}>{props.children}</Button>
      </div>
    );
  },
};

export default meta;
