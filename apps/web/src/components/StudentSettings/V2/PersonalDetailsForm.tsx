import { Form } from "@litespace/ui/Form";
import UploadPhoto from "@/components/StudentSettings/V2/UploadPhoto";
import { Input } from "@litespace/ui/Input";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Select } from "@litespace/ui/Select";
import { governorates } from "@/constants/user";
import { useCallback, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { IUser } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import { orUndefined } from "@litespace/utils";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { useOnError } from "@/hooks/error";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { isEqual } from "lodash";
import { PatternInput } from "@litespace/ui/PatternInput";
import { ConfirmContactMethod } from "@/components/StudentSettings/V2/ConfirmContactMethod";
import {
  isValidEmail,
  isValidPhone,
  isValidUserName,
} from "@litespace/ui/lib/validate";

type FormProps = {
  name: string | null;
  email: string;
  phone?: string | null;
  city?: IUser.City | null;
  gender?: IUser.Gender | null;
};

function canSubmit(formData: FormProps, user: FormProps) {
  const initial = {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    city: user.city || null,
    gender: user.gender || null,
  };

  return !isEqual(formData, initial);
}

export default function PersonalDetailsForm({
  personalDetails,
  id,
  image,
}: {
  personalDetails: FormProps;
  image: string | null;
  id: number;
}) {
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const validators = useMakeValidators<FormProps>({
    name: {
      validate: isValidUserName,
    },
    email: {
      validate: isValidEmail,
    },
    phone: {
      validate: isValidPhone,
    },
  });

  const form = useForm<FormProps>({
    defaults: {
      name: personalDetails.name,
      email: personalDetails.email,
      phone: personalDetails.phone,
      city: personalDetails.city,
      gender: orUndefined(personalDetails.gender),
    },
    validators,
    onSubmit: (data) => {
      if (!data || !canSubmit(data, personalDetails)) return;

      mutation.mutate({
        id: id,
        payload: {
          ...data,
          gender: orUndefined(data.gender),
        },
      });
    },
  });

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
      <UploadPhoto id={id} name={personalDetails.name} image={image} />
      <div className="flex gap-10 mt-6">
        <div className="w-full ">
          <Form
            onSubmit={form.onFormSubmit}
            className="w-full flex flex-col gap-4"
          >
            <Input
              value={orUndefined(form.state.name)}
              onChange={(e) => form.set("name", e.target.value)}
              name="name"
              id="name"
              label={intl("labels.name")}
              placeholder={intl("labels.name.placeholder")}
              state={form.errors?.name ? "error" : undefined}
              helper={form.errors?.name}
            />
            <Input
              value={orUndefined(form.state.email)}
              onChange={(e) => form.set("email", e.target.value)}
              name="email"
              id="email"
              label={intl("labels.email")}
              placeholder={intl("labels.email.placeholder")}
              state={form.errors?.email ? "error" : undefined}
              helper={form.errors?.email}
            />
            <PatternInput
              mask=" "
              format="### #### ####"
              value={orUndefined(form.state.phone)}
              onChange={(e) =>
                form.set("phone", e.target.value.replace(/\s/g, ""))
              }
              name="phone"
              id="phone"
              label={intl("labels.phone")}
              placeholder={intl("labels.phone.placeholder")}
              state={form.errors?.phone ? "error" : undefined}
              helper={form.errors?.phone}
            />
            <Select
              value={orUndefined(form.state.city)}
              onChange={(value) => form.set("city", value)}
              id="city"
              options={cityOptions}
              label={intl("labels.city")}
              placeholder={intl("labels.city.placeholder")}
            />
            <Select
              value={orUndefined(form.state.gender)}
              onChange={(value) => form.set("gender", value)}
              id="gender"
              options={genderOptions}
              label={intl("labels.gender")}
              placeholder={intl("labels.gender.student-placeholder")}
            />
          </Form>
          <Button
            size="large"
            disabled={
              mutation.isPending || !canSubmit(form.state, personalDetails)
            }
            onClick={form.submit}
            className="mt-10"
          >
            {intl("shared-settings.save")}
          </Button>
        </div>
        <ConfirmContactMethod />
      </div>
    </div>
  );
}
