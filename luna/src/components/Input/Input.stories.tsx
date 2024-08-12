import type { Meta, StoryObj } from "@storybook/react";

import { Input, InputType } from "@/components/Input";
import React from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { useForm } from "react-hook-form";

type Component = typeof Input;

const meta: Meta<Component> = {
  title: "Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => {
      return (
        <Direction>
          <div className="bg-surface-200 w-[30rem] h-[30rem] px-12 flex items-center justify-center shadow-xl rounded-md">
            <Story />
          </div>
        </Direction>
      );
    },
  ],
};

export const Idle: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
  },
};

export const Disabled: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    disabled: true,
    value: "Some value",
  },
};

export const IdelWithValue: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    value: "لايت اسبيس",
    onChange: () => {},
  },
};

export const Error: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    error: ar["errors.email.invlaid"],
  },
};

export const ErrorWithValue: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    error: ar["errors.email.invlaid"],
    value: "لايت اسبيس",
    onChange: () => {},
  },
};

export const Password: StoryObj<Component> = {
  args: {},
  render: () => {
    const { register, watch } = useForm<{ password: string }>({
      defaultValues: { password: "" },
    });
    return (
      <Direction>
        <div className="w-[50rem]">
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

export const PasswordError: StoryObj<Component> = {
  args: {},
  render: () => {
    const { register, watch } = useForm<{ password: string }>({
      defaultValues: { password: "" },
    });
    return (
      <Direction>
        <div className="w-[50rem]">
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

export const InputEnglish: StoryObj<Component> = {
  render: () => {
    const { register, watch } = useForm<{ email: string }>({
      defaultValues: { email: "" },
    });
    return (
      <Direction>
        <div className="w-[50rem]">
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
