import type { Meta, StoryObj } from "@storybook/react";
import { toaster } from "@/components/Toast/toaster";
import { Button, ButtonType } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import "react-toastify/dist/ReactToastify.min.css";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";

type Component = typeof Button;

const meta: Meta<Component> = {
  title: "Toast",
  component: Button,
  parameters: { layout: "centered" },
  decorators: [DarkStoryWrapper],
};

export const Success: StoryObj<Component> = {
  args: {
    children: ar["page.login.form.button.submit.label"],
    onClick() {
      toaster.success({
        title: ar["page.login.form.title"],
        description: ar["error.email.invlaid"],
      });
    },
  },
};

export const Error: StoryObj<Component> = {
  args: {
    children: ar["page.login.form.button.submit.label"],
    type: ButtonType.Error,
    onClick() {
      toaster.error({
        title: ar["page.login.form.title"],
        description: ar["error.email.invlaid"],
      });
    },
  },
};

export const Info: StoryObj<Component> = {
  args: {
    children: ar["page.login.form.button.submit.label"],
    type: ButtonType.Secondary,
    onClick() {
      toaster.info({
        title: ar["page.login.form.title"],
        description: ar["error.email.invlaid"],
      });
    },
  },
};

export const Warning: StoryObj<Component> = {
  args: {
    children: ar["page.login.form.button.submit.label"],
    type: ButtonType.Error,
    onClick() {
      toaster.warning({
        title: ar["page.login.form.title"],
        description: ar["error.email.invlaid"],
      });
    },
  },
};

export default meta;
