import { TextEditor as BaseTextEditor } from "@/components/TextEditor";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

export function TextEditor<T extends FieldValues>({
  control,
  name,
  value,
  error,
  className,
  heading = true,
}: {
  control: Control<T>;
  name: Path<T>;
  value: string;
  error?: string;
  className?: string;
  heading?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <BaseTextEditor
          setValue={field.onChange}
          value={value}
          error={error}
          className={className}
          heading={heading}
        />
      )}
    />
  );
}
