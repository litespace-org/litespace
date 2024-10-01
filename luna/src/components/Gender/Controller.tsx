import Gender from "@/components/Gender/Gender";
import { IUser } from "@litespace/types";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

export default function Controlled<T extends FieldValues>({
  control,
  name,
  value,
}: {
  control: Control<T>;
  name: Path<T>;
  value?: IUser.Gender;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Gender setGender={field.onChange} gender={value} />
      )}
    />
  );
}
