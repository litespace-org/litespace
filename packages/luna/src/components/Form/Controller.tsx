import { TextEditor as BaseTextEditor } from "@/components/TextEditor";
import {
  Control,
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  Path,
} from "react-hook-form";
import { Input as BaseInput, InputProps } from "@/components/Input/Input";
import {
  NumericInput as BaseNumericInput,
  NumericInputProps,
} from "@/components/NumericInput";
import { IUser } from "@litespace/types";
import { Gender as BaseGender } from "@/components/Gender";
import { Duration as BaseDuration } from "@/components/Duration";
import { Duration as IDuration } from "@litespace/sol";
import { useDurationUnitMap } from "@/hooks/duration";
import { Textarea as BaseTextarea } from "@/components/Textarea";
import { TextareaProps } from "@/components/Textarea/Textarea";
import {
  DateInput as BaseDateInput,
  DateInputProps,
} from "@/components/DateInput";
import { Select as BaseSelect, SelectProps } from "@/components/Select";
import { Switch as BaseSwitch, SwitchProps } from "@/components/Switch";

import {
  TimePicker as BaseTimePicker,
  TimePickerProps,
} from "@/components/TimePicker";
import {
  WeekdayPicker as BaseWeekdayPicker,
  WeekdayPickerProps,
} from "@/components/WeekdayPicker";

export function TextEditor<T extends FieldValues>({
  control,
  name,
  value,
  className,
  disabled,
  rules,
}: {
  control: Control<T>;
  name: Path<T>;
  value: string;
  className?: string;
  disabled?: boolean;
  rules?: ControllerProps<T>["rules"];
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => (
        <BaseTextEditor
          error={formState.errors[name]?.message as string}
          disabled={disabled}
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

export function NumericInput<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: N;
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
            onValueChange={(value) => field.onChange(value.floatValue)}
            error={formState.errors[name]?.message as string}
          />
        );
      }}
    />
  );
}

export function DateInput<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & DateInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => {
        return (
          <BaseDateInput
            {...props}
            {...field}
            error={formState.errors[name]?.message as string}
          />
        );
      }}
    />
  );
}

export function TimePicker<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & TimePickerProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => {
        return (
          <BaseTimePicker
            {...props}
            {...field}
            error={formState.errors[name]?.message as string}
          />
        );
      }}
    />
  );
}

export function WeekdayPicker<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & WeekdayPickerProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        return <BaseWeekdayPicker {...props} {...field} />;
      }}
    />
  );
}

export function Select<T extends FieldValues, P extends string | number>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & SelectProps<P>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        return <BaseSelect {...props} {...field} />;
      }}
    />
  );
}

export function Gender<T extends FieldValues>({
  control,
  name,
  value,
  disabled,
  student,
}: {
  control: Control<T>;
  name: Path<T>;
  value?: IUser.Gender;
  disabled?: boolean;
  student: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <BaseGender
          disabled={disabled}
          setGender={field.onChange}
          gender={value}
          student={student}
        />
      )}
    />
  );
}

export function Duration<T extends FieldValues>({
  control,
  name,
  value,
  disabled,
  placeholder,
  rules,
}: {
  control: Control<T>;
  name: Path<T>;
  value?: IDuration;
  disabled?: boolean;
  placeholder?: string;
  rules?: ControllerProps<T>["rules"];
}) {
  const labels = useDurationUnitMap();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => (
        <BaseDuration
          labels={labels}
          disabled={disabled}
          onChange={field.onChange}
          value={value}
          placeholder={placeholder}
          error={formState.errors[name]?.message as string}
        />
      )}
    />
  );
}

export function Textarea<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & TextareaProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => (
        <BaseTextarea
          error={formState.errors[name]?.message as string}
          {...field}
          {...props}
        />
      )}
    />
  );
}

export function Switch<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & SwitchProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        return (
          <BaseSwitch
            onChange={field.onChange}
            checked={field.value}
            {...props}
          />
        );
      }}
    />
  );
}
