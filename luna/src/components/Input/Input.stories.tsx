import type { Meta, StoryObj } from "@storybook/react";

import { Input, InputType } from "@/components/Input";
import React, { ComponentProps } from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { useForm } from "react-hook-form";

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
    placeholder: ar["global.form.email.placeholder"],
  },
};

export const IdelWithValue: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    value: "لايت اسبيس",
    onChange: () => {},
  },
};

export const Error: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    error: ar["errors.email.invlaid"],
  },
};

export const ErrorWithValue: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    error: ar["errors.email.invlaid"],
    value: "لايت اسبيس",
    onChange: () => {},
  },
};

export const Password: StoryObj<typeof Wrapper> = {
  args: {},
  render: () => {
    const { register, watch } = useForm<{ password: string }>({
      defaultValues: { password: "" },
    });
    return (
      <Direction>
        <div className="ui-w-[50rem]">
          <Input
            type={InputType.Password}
            placeholder={ar["global.form.password.label"]}
            value={watch("password")}
            register={register("password")}
          />
        </div>
      </Direction>
    );
  },
};

export const PasswordError: StoryObj<typeof Wrapper> = {
  args: {},
  render: () => {
    const { register, watch } = useForm<{ password: string }>({
      defaultValues: { password: "" },
    });
    return (
      <Direction>
        <div className="ui-w-[50rem]">
          <Input
            type={InputType.Password}
            placeholder={ar["global.form.password.label"]}
            value={watch("password")}
            register={register("password")}
            error={ar["errors.password.invlaid"]}
          />
        </div>
      </Direction>
    );
  },
};

export const InputEnglish = {
  render: () => {
    const { register, watch } = useForm<{ email: string }>({
      defaultValues: { email: "" },
    });
    return (
      <Direction>
        <div className="ui-w-[50rem]">
          <Input
            type={InputType.Text}
            placeholder={ar["global.form.email.placeholder"]}
            value={watch("email")}
            register={register("email")}
          />
        </div>
      </Direction>
    );
  },
};

export default meta;
