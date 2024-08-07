import type { Meta, StoryObj } from "@storybook/react";

import { Input, InputType } from "@/components/Input";
import { Form } from "@/components/Form";
import React, { ComponentProps, useCallback } from "react";
import { Direction } from "@/components/Direction";
import { Button } from "@/components/Button";
import ar from "@/locales/ar-eg.json";
import { SubmitHandler } from "react-hook-form";

type IFormInputs = {
  email: string;
};

const Wrapper: React.FC<ComponentProps<typeof Input>> = (props) => {
  const onSubmit: SubmitHandler<IFormInputs> = useCallback((data) => {
    console.log(data);
  }, []);

  return (
    <Direction>
      <div className="ui-max-w-screen-md ui-mx-auto ui-my-10">
        <Form<IFormInputs> onSubmit={onSubmit}>
          <Input {...props} />
          <div className="ui-mt-4">
            <Button>{ar["page.register.form.button.submit.label"]}</Button>
          </div>
        </Form>
      </div>
    </Direction>
  );
};

const meta: Meta<typeof Wrapper> = {
  title: "Form",
  component: Wrapper,
  parameters: {},
};

export const WithPassword: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    type: InputType.Text,
    label: ar["global.form.email.label"],
    placeholder: ar["global.form.email.placeholder"],
    autoComplete: "off",
  },
};

export default meta;
