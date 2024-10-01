import { TextEditor as BaseTextEditor } from "@/components/TextEditor";
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { Input as BaseInput, InputProps } from "@/components/Input/Input";
import {
  NumericInput as BaseNumericInput,
  NumericInputProps,
} from "@/components/NumericInput";

export function TextEditor<T extends FieldValues>({
  control,
  name,
  value,
  className,
}: {
  control: Control<T>;
  name: Path<T>;
  value: string;
  className?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, formState }) => (
        <BaseTextEditor
          error={formState.errors[name]?.message as string}
          setValue={field.onChange}
          className={className}
          value={value}
        />
      )}
    />
  );
}

export function Input<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & InputProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => (
        <BaseInput
          {...field}
          {...props}
          error={formState.errors[name]?.message as string}
        />
      )}
    />
  );
}

export function NumericInput<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & NumericInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => {
        return (
          <BaseNumericInput
            {...props}
            {...field}
            error={formState.errors[name]?.message as string}
          />
        );
      }}
    />
  );
}
