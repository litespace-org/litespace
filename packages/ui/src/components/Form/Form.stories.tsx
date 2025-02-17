import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@/components/Input";
import { Form } from "@/components/Form";
import React from "react";
import { Direction } from "@/components/Direction";
import { faker } from "@faker-js/faker/locale/ar";

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
        <Input
          type="text"
          placeholder={faker.lorem.words(4)}
          autoComplete="off"
          label={faker.lorem.words(2)}
        />
      </div>
    ),
  },
};

export default meta;
