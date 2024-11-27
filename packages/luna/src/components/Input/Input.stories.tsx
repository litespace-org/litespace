import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/Input";
import React, { useState } from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { useForm } from "react-hook-form";
import { Calendar } from "react-feather";
import Search from "@litespace/assets/Search";
import { faker } from "@faker-js/faker/locale/ar";
import { faker as fakeren } from "@faker-js/faker/locale/en";

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
    placeholder: faker.internet.email(),
    idleDir: "ltr",
  },
  render(props) {
    const [value, setValue] = useState("");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const ArabicPlaceholder: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.person.fullName(),
    idleDir: "rtl",
  },
  render(props) {
    const [value, setValue] = useState("");
    return (
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

export const LTRDefaultDir: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: faker.internet.email(),
    idleDir: "ltr",
  },
};

export const Disabled: StoryObj<Component> = {
  args: {
    id: "name",
    disabled: true,
    value: faker.internet.email(),
  },
};

export const IdelWithValueArabic: StoryObj<Component> = {
  args: {
    id: "name",
    value: faker.lorem.words(5),
    onChange: () => {},
  },
};

export const IdelWithValueEnglish: StoryObj<Component> = {
  args: {
    id: "name",
    value: fakeren.lorem.words(5),
    onChange: () => {},
  },
};

export const Error: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    error: true,
    helper: ar["error.email.invlaid"],
  },
};

export const WithHelperText: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    helper: ar["error.email.invlaid"],
  },
};

export const ErrorWithValue: StoryObj<Component> = {
  args: {
    id: "name",
    placeholder: ar["global.form.email.placeholder"],
    error: true,
    helper: ar["error.email.invlaid"],
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
        type="password"
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
        type="password"
        value={watch("password")}
        error={true}
        helper={ar["error.invalid"]}
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
        type="password"
        placeholder={ar["global.form.email.placeholder"]}
        value={watch("email")}
        {...register("email")}
      />
    );
  },
};

export const WithStartActions: StoryObj<Component> = {
  render: () => {
    const { register } = useForm<{ date: string }>({
      defaultValues: { date: "" },
    });
    return (
      <Input
        placeholder={ar["global.form.email.placeholder"]}
        {...register("date")}
        startActions={[
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

export const WithEndActions: StoryObj<Component> = {
  render: () => {
    const { register } = useForm<{ date: string }>({
      defaultValues: { date: "" },
    });
    return (
      <Input
        placeholder={ar["global.form.email.placeholder"]}
        {...register("date")}
        endActions={[
          {
            id: 1,
            Icon: Search,
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
