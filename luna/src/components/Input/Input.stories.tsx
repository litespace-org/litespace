import type { Meta, StoryObj } from "@storybook/react";

import { Input, InputType } from "@/components/Input";
import React, { ComponentProps, useState } from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";

const Wrapper: React.FC<ComponentProps<typeof Input>> = (props) => {
  return (
    <Direction>
      <div className="ui-w-[40rem]">
        <Input {...props} />
      </div>
    </Direction>
  );
};

const meta: Meta<typeof Input> = {
  title: "Input",
  component: Wrapper,
  parameters: { layout: "centered" },
};

export const Idle: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    label: ar["global.form.email.label"],
    placeholder: ar["global.form.email.placeholder"],
  },
};

export const IdelWithValue: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    label: ar["global.form.email.label"],
    placeholder: ar["global.form.email.placeholder"],
    value: "لايت اسبيس",
    onChange: () => {},
  },
};

export const Error: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    label: ar["global.form.email.label"],
    placeholder: ar["global.form.email.placeholder"],
    error: ar["errors.email.invlaid"],
  },
};

export const ErrorWithValue: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    label: ar["global.form.email.label"],
    placeholder: ar["global.form.email.placeholder"],
    error: ar["errors.email.invlaid"],
    value: "لايت اسبيس",
    onChange: () => {},
  },
};

export const Password: StoryObj<typeof Wrapper> = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string>("");
    return (
      <Direction>
        <div className="ui-w-[50rem]">
          <Input
            type={InputType.Password}
            id="name"
            label={ar["global.form.password.label"]}
            placeholder={ar["global.form.password.label"]}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
      </Direction>
    );
  },
};

export const PasswordError: StoryObj<typeof Wrapper> = {
  args: {},
  render: () => {
    const [value, setValue] = useState<string>("");
    return (
      <Direction>
        <div className="ui-w-[50rem]">
          <Input
            type={InputType.Password}
            id="name"
            label={ar["global.form.password.label"]}
            placeholder={ar["global.form.password.label"]}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            error={ar["errors.password.invlaid"]}
          />
        </div>
      </Direction>
    );
  },
};

export const InputEnglish = {
  render: () => {
    const [value, setValue] = useState<string>("");
    return (
      <Direction>
        <div className="ui-w-[50rem]">
          <Input
            type={InputType.Text}
            id="name"
            label={ar["global.form.email.label"]}
            placeholder={ar["global.form.email.placeholder"]}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
      </Direction>
    );
  },
};

export default meta;
