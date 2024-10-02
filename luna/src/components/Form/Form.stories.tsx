import type { Meta, StoryObj } from "@storybook/react";

import { Input, InputType } from "@/components/Input";
import { Form } from "@/components/Form";
import React from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { Label } from "@/components/Form/Label";
import { Field } from "@/components/Form/Field";

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
      <div className="tw-ui-w-[40rem]">
        <Field
          label={<Label id="name">{ar["global.form.email.label"]}</Label>}
          field={
            <Input
              type={InputType.Text}
              placeholder={ar["global.form.email.placeholder"]}
              autoComplete="off"
            />
          }
        />
      </div>
    ),
  },
};

export default meta;
