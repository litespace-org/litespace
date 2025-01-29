import type { Meta, StoryObj } from "@storybook/react";
import { TextEditor } from "@/components/TextEditor";
import { DarkStoryWrapper } from "@/internal/DarkWrapper";
import ar from "@/locales/ar-eg.json";
import { Controller, useForm } from "react-hook-form";

const meta: Meta<typeof TextEditor> = {
  title: "Text Editor",
  component: TextEditor,
  parameters: {
    layout: "centered",
  },
  decorators: [DarkStoryWrapper],
};

export const Primary: StoryObj<typeof TextEditor> = {
  args: {},
  render() {
    const form = useForm<{ value: string }>({
      defaultValues: {
        value: "",
      },
    });

    return (
      <div>
        <Controller
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextEditor
              setValue={field.onChange}
              value={form.watch("value")}
              error={form.formState.errors.value?.message}
            />
          )}
        />
      </div>
    );
  },
};

export const Errored: StoryObj<typeof TextEditor> = {
  args: {
    error: ar["error.email.invlaid"],
  },
};

export default meta;
