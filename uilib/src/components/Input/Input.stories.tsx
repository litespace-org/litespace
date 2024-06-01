import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@/components/Input";
import { Form } from "@/components/Form";
import React, { ComponentProps } from "react";
import { Direction } from "@/components/Direction";

const Wrapper: React.FC<ComponentProps<typeof Input>> = (props) => {
  return (
    <Direction>
      <Form>
        <Input {...props} />
      </Form>
    </Direction>
  );
};

const meta: Meta<typeof Input> = {
  title: "Input",
  component: Wrapper,
  parameters: {
    layout: "centered",
  },
};

export const Primary: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    label: "Name",
    placeholder: "Name",
  },
};

export default meta;
