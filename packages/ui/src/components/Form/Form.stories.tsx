import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@/components/Input";
import { Form } from "@/components/Form";
import React from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";

type IForm = typeof Form;

const meta: Meta<IForm> = {
  title: "Form",
  component: Form,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC<{ children?: React.ReactNode }>) => (
      <Direction>
        <Story />
      </Direction>
    ),
  ],
};

export const Primary: StoryObj<IForm> = {
  args: {
    children: (
      <div className="ui-w-[40rem]">
        <Input
          type="text"
          placeholder={ar["global.form.email.placeholder"]}
          autoComplete="off"
          label={ar["global.form.email.label"]}
        />
      </div>
    ),
  },
};

export default meta;
