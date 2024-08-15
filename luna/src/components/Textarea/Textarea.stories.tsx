import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "@/components/Textarea/Textarea";
import { Direction } from "@/components/Direction";
import ar from "@/locales/ar-eg.json";
import { useForm } from "react-hook-form";
import { Field, Form, Label } from "../Form";
import { Button } from "../Button";

type Component = typeof Textarea;

const meta: Meta<Component> = {
  title: "Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
};

export const PrimaryInteractive: StoryObj<Component> = {
  render: () => {
    const {
      register,
      watch,
      formState: { errors },
      handleSubmit,
    } = useForm<{ feedback: string }>({
      defaultValues: { feedback: "" },
    });

    return (
      <Direction>
        <Form onSubmit={handleSubmit(() => {})} className="ui-w-[50rem]">
          <Field
            label={<Label>{ar["global.add.to.favorites"]}</Label>}
            field={
              <Textarea
                value={watch("feedback")}
                placeholder={ar["global.start.chating"]}
                register={register("feedback", {
                  required: { value: true, message: ar["error.required"] },
                })}
                error={errors["feedback"]?.message}
              />
            }
          />

          <Button>{ar["global.report.label"]}</Button>
        </Form>
      </Direction>
    );
  },
};

export const Errored: StoryObj<Component> = {
  args: {
    placeholder: ar["global.start.chating"],
    error: ar["error.required"],
    className: "ui-min-w-[600px] ui-border",
  },
  render: (props: object) => {
    return (
      <Direction>
        <Textarea {...props} />
      </Direction>
    );
  },
};

export default meta;
