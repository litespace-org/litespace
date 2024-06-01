import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@/components/Input";
import { Form } from "@/components/Form";
import React, { ComponentProps } from "react";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";

const Wrapper: React.FC<ComponentProps<typeof Input>> = (props) => {
  return (
    <Direction>
      <div className="ui-w-80">
        <Form>
          <Input {...props} />
        </Form>
      </div>
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
    label: ar["global.form.email.label"],
    placeholder: ar["global.form.email.placeholder"],
  },
};

export default meta;
