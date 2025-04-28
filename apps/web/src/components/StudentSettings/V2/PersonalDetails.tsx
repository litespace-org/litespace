import UploadPhoto from "@/components/StudentSettings/V2/UploadPhoto";
import { Input } from "@litespace/ui/Input";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Select } from "@litespace/ui/Select";
import { governorates } from "@/constants/user";
import { useCallback, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { IUser } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import {
  getNullableFiledUpdatedValue,
  getOptionalFieldUpdatedValue,
  optional,
} from "@litespace/utils";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { useOnError } from "@/hooks/error";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { PatternInput } from "@litespace/ui/PatternInput";
import { ConfirmContactMethod } from "@/components/StudentSettings/V2/ConfirmContactMethod";
import {
  isValidEmail,
  isValidPhone,
  isValidUserName,
} from "@litespace/ui/lib/validate";

type Form = {
  name: string;
  email: string;
  phone: string;
  city: IUser.City | null;
  gender: IUser.Gender | null;
};

export default function PersonalDetailsForm({
  id,
  name,
  email,
  image,
  phone,
  city,
  gender,
}: {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  city: IUser.City | null;
  gender: IUser.Gender | null;
}) {
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const validators = useMakeValidators<Form>({
    name: { required: !!name, validate: isValidUserName },
    email: { required: true, validate: isValidEmail },
    phone: { required: false, validate: isValidPhone },
  });

  const form = useForm<Form>({
    defaults: {
      name: name || "",
      phone: phone || "",
      email,
      city,
      gender,
    },
    validators,
    onSubmit: (data) => {
      mutation.mutate({
        id: id,
        payload: {
          name: getNullableFiledUpdatedValue(name, data.name || null),
          phone: getNullableFiledUpdatedValue(phone, data.phone || null),
          email: getOptionalFieldUpdatedValue(email, data.email),
          city: getNullableFiledUpdatedValue(city, data.city),
          gender: getNullableFiledUpdatedValue(gender, data.gender),
        },
      });
    },
  });

  const unchanged = useMemo(() => {
    return (
      (name || "") === form.state.name &&
      (phone || "") === form.state.phone &&
      email === form.state.email &&
      city === form.state.city &&
      gender === form.state.gender
    );
  }, [
    city,
    email,
    form.state.city,
    form.state.email,
    form.state.gender,
    form.state.name,
    form.state.phone,
    gender,
    name,
    phone,
  ]);

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
  }, [invalidateQuery]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("shared-settings.update.error"),
        description: intl(messageId),
      });
    },
  });
  const mutation = useUpdateUser({ onSuccess, onError });

  const cityOptions = useMemo(
    () =>
      Object.entries(governorates).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const genderOptions = useMemo(
    () => [
      { label: intl("labels.gender.male-student"), value: IUser.Gender.Male },
      {
        label: intl("labels.gender.female-student"),
        value: IUser.Gender.Female,
      },
    ],
    [intl]
  );

  return (
    <div>
      <UploadPhoto id={id} name={name} image={image} />
      <div className="flex gap-10 mt-6">
        <div className="w-[400px] flex-shrink-0">
          <form
            onSubmit={form.onFormSubmit}
            className="w-full flex flex-col gap-4"
          >
            <Input
              id="name"
              name="name"
              value={form.state.name}
              onChange={(e) => form.set("name", e.target.value)}
              label={intl("labels.name")}
              placeholder={intl("labels.name.placeholder")}
              state={form.errors?.name ? "error" : undefined}
              helper={form.errors?.name}
              autoComplete="off"
            />

            <Input
              id="email"
              name="email"
              value={form.state.email}
              onChange={(e) => form.set("email", e.target.value)}
              label={intl("labels.email")}
              placeholder={intl("labels.email.placeholder")}
              state={form.errors?.email ? "error" : undefined}
              helper={form.errors?.email}
              autoComplete="off"
            />
            <PatternInput
              id="phone"
              name="phone"
              mask=" "
              format="### #### ####"
              value={optional(form.state.phone)}
              onValueChange={(e) => form.set("phone", e.value)}
              label={intl("labels.phone")}
              placeholder={intl("labels.phone.placeholder")}
              state={form.errors?.phone ? "error" : undefined}
              helper={form.errors?.phone}
              autoComplete="off"
            />

            <Select
              id="city"
              value={optional(form.state.city)}
              onChange={(value) => form.set("city", value)}
              options={cityOptions}
              label={intl("labels.city")}
              placeholder={intl("labels.city.placeholder")}
              state={form.errors.city ? "error" : undefined}
              helper={form.errors?.city}
            />

            <Select
              id="gender"
              value={optional(form.state.gender)}
              onChange={(value) => form.set("gender", value)}
              options={genderOptions}
              label={intl("labels.gender")}
              placeholder={intl("labels.gender.student-placeholder")}
              state={form.errors.gender ? "error" : undefined}
              helper={form.errors?.gender}
            />
          </form>
          <Button
            size="large"
            disabled={mutation.isPending || unchanged}
            loading={mutation.isPending}
            onClick={form.submit}
            className="mt-10"
          >
            {intl("shared-settings.save")}
          </Button>
        </div>

        <div className="max-w-[640px]">
          <ConfirmContactMethod />
        </div>
      </div>
    </div>
  );
}
