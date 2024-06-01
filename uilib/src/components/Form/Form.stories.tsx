import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "@/components/Input";
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
            <Button>{ar["page.register.form.button.label"]}</Button>
          </div>
        </Form>
      </div>
    </Direction>
  );
};

const meta: Meta<typeof Input> = {
  title: "Form",
  component: Wrapper,
  parameters: {},
};

export const Text: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    label: ar["page.register.form.email.label"],
    placeholder: ar["page.register.form.email.placeholder"],
    validation: {
      required: { value: true, message: ar["errors.required"] },
      pattern: {
        value: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/gi,
        message: ar["errors.email.invlaid"],
      },
    },
  },
};

export const WithPassword: StoryObj<typeof Wrapper> = {
  args: {
    id: "name",
    type: "password",
    label: ar["page.register.form.password.label"],
    validation: {
      required: { value: true, message: ar["errors.required"] },
      pattern: {
        value:
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
        message: ar["errors.password.invlaid"],
      },
    },
  },
};

export default meta;
