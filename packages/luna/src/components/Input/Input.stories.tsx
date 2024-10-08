import type { Meta, StoryObj } from "@storybook/react";

import { Input, InputType } from "@/components/Input";
import React from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { useForm } from "react-hook-form";
import { Calendar } from "react-feather";

type Component = typeof Input;

const meta: Meta<Component> = {
  title: "Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => {
      return (
        <Direction>
          <div className="tw-bg-background-200 tw-w-[30rem] tw-h-[30rem] tw-px-12 tw-flex tw-items-center tw-justify-center tw-shadow-xl tw-md">
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
    error: ar["error.email.invlaid"],
  },
};

export const ErrorWithValue: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    error: ar["error.email.invlaid"],
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
      <Input
        type={InputType.Password}
        value={watch("password")}
        {...register("password")}
      />
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
      <Input
        type={InputType.Password}
        value={watch("password")}
        error={ar["error.invalid"]}
        {...register("password")}
      />
    );
  },
};

export const InputEnglish: StoryObj<Component> = {
  render: () => {
    const { register, watch } = useForm<{ email: string }>({
      defaultValues: { email: "" },
    });
    return (
      <Input
        type={InputType.Text}
        placeholder={ar["global.form.email.placeholder"]}
        value={watch("email")}
        {...register("email")}
      />
    );
  },
};

export const WithActions: StoryObj<Component> = {
  render: () => {
    const { register, watch } = useForm<{ date: string }>({
      defaultValues: { date: "" },
    });
    return (
      <Input
        placeholder={ar["global.form.email.placeholder"]}
        value={watch("date")}
        {...register("date")}
        actions={[
          {
            id: 1,
            Icon: Calendar,
            onClick() {
              alert("Clicked!");
            },
          },
        ]}
      />
    );
  },
};

export default meta;
