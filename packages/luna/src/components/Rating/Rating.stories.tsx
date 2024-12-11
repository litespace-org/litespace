import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Rating } from "@/components/Rating/Rating";
import { Direction } from "@/components/Direction";
import { Controller, useForm } from "react-hook-form";
import { Form } from "@/components/Form";

type Component = typeof Rating;

const meta: Meta<Component> = {
  title: "Rating",
  component: Rating,
  parameters: { layout: "centered" },
};

export const Primary: StoryObj<Component> = {
  render: () => {
    return (
      <Direction>
        <Rating />
      </Direction>
    );
  },
};

export const Selected: StoryObj<Component> = {
  args: {
    value: 1,
  },
  render: (props: object) => {
    return (
      <Direction>
        <Rating {...props} />
      </Direction>
    );
  },
};

export const Interactive: StoryObj<Component> = {
  render: () => {
    const { watch, handleSubmit, control } = useForm<{ rating: number }>({
      defaultValues: { rating: 0 },
    });
    return (
      <Direction>
        <Form onSubmit={handleSubmit(() => {})}>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <Rating onChange={field.onChange} value={watch("rating")} />
            )}
          />
        </Form>
      </Direction>
    );
  },
};

export default meta;
