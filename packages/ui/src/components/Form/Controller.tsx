import {
  DateInput as BaseDateInput,
  DateInputProps,
} from "@/components/DateInput";
import { Duration as BaseDuration } from "@/components/Duration";
import { Gender as BaseGender } from "@/components/Gender";
import { Input as BaseInput, InputProps } from "@/components/Input/V2/Input";
import {
  NumericInput as BaseNumericInput,
  NumericInputProps,
} from "@/components/NumericInput";
import {
  PatternInput as BasePatternInput,
  PatternInputProps,
} from "@/components/PatternInput";
import { Rating as BaseRating } from "@/components/Rating";
import { Select as BaseSelect, SelectProps } from "@/components/Select";
import { Switch as BaseSwitch, SwitchProps } from "@/components/Switch";
import { Textarea as BaseTextarea } from "@/components/Textarea";
import { TextareaProps } from "@/components/Textarea/Textarea";
import { TextEditor as BaseTextEditor } from "@/components/TextEditor";
import { Duration as IDuration } from "@litespace/utils/duration";
import Eye from "@litespace/assets/Eye";
import EyeSlash from "@litespace/assets/EyeSlash";
import { IUser } from "@litespace/types";
import {
  Control,
  Controller,
  ControllerProps,
  FieldValues,
  Path,
} from "react-hook-form";
import {
  TimePicker as BaseTimePicker,
  TimePickerProps,
} from "@/components/TimePicker";
import {
  WeekdayPicker as BaseWeekdayPicker,
  WeekdayPickerProps,
} from "@/components/WeekdayPicker";
import { useState } from "react";

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
      render={({ field }) => {
        return <BaseInput {...field} {...props} />;
      }}
    />
  );
}

export function Password<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & InputProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        return (
          <BaseInput
            placeholder="******************"
            autoComplete="off"
            type={hidden ? "password" : "text"}
            idleDir="ltr"
            endAction={{
              Icon: hidden ? EyeSlash : Eye,
              id: 4,
              onClick: () => setHidden((prev) => !prev),
            }}
            {...field}
            {...props}
          />
        );
      }}
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
        const message = formState.errors[name]?.message as string;
        return (
          <BaseNumericInput
            {...props}
            onValueChange={(value) => field.onChange(value.floatValue)}
            helper={message}
            error={!!message}
          />
        );
      }}
    />
  );
}

export function PatternInput<T extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: {
  control: Control<T>;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
} & PatternInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => {
        const message = formState.errors[name]?.message as string;
        return (
          <BasePatternInput
            {...props}
            onValueChange={(value) => field.onChange(value.value)}
            helper={message}
            error={!!message}
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
        return <BaseSelect onChange={field.onChange} {...props} />;
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
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, formState }) => {
        const message = formState.errors[name]?.message as string;
        return (
          <BaseDuration
            disabled={disabled}
            onChange={field.onChange}
            value={value}
            placeholder={placeholder}
            error={!!message}
            helper={message}
          />
        );
      }}
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
      render={({ field }) => <BaseTextarea {...field} {...props} />}
    />
  );
}

export function Rating<T extends FieldValues>({
  control,
  name,
  rules,
  value,
  ...props
}: {
  control: Control<T>;
  value: number;
  name: Path<T>;
  rules?: ControllerProps<T>["rules"];
}) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        return (
          <BaseRating onChange={field.onChange} value={value} {...props} />
        );
      }}
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
