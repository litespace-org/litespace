import UploadPhoto from "@/components/StudentSettings/UploadPhoto";
import { Input } from "@litespace/ui/Input";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Select } from "@litespace/ui/Select";
import { governorates } from "@/constants/user";
import React, { useCallback, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { IUser } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import {
  getNullableFieldUpdatedValue,
  getOptionalFieldUpdatedValue,
  isEmptyObject,
  optional,
} from "@litespace/utils";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";
import { useOnError } from "@/hooks/error";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { PatternInput } from "@litespace/ui/PatternInput";
import { ConfirmContactMethod } from "@/components/Settings/ConfirmContactMethod";
import {
  validateEmail,
  validateNotice,
  validatePhone,
  validateUserName,
} from "@litespace/ui/lib/validate";
import { Typography } from "@litespace/ui/Typography";
import { NumericInput } from "@litespace/ui/NumericInput";
import { formatMinutes } from "@litespace/ui/utils";
import { useBlock } from "@litespace/ui/hooks/common";

type Form = {
  name: string;
  email: string;
  phone: string;
  city: IUser.City | null;
  notice: number;
  studio?: number | null;
  gender: IUser.Gender | null;
};

type Props = {
  id: number;
  forStudent: boolean;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  city: IUser.City | null;
  gender: IUser.Gender | null;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  notice: number;
};

function asUpdatePayload(
  current: {
    name: string | null;
    email: string;
    phone: string | null;
    city: IUser.City | null;
    gender: IUser.Gender | null;
    notice: number;
  },
  updated: Form
) {
  return {
    name: getNullableFieldUpdatedValue(current.name, updated.name || null),
    phone: getNullableFieldUpdatedValue(current.phone, updated.phone || null),
    email: getOptionalFieldUpdatedValue(current.email, updated.email),
    city: getNullableFieldUpdatedValue(current.city, updated.city),
    notice: getOptionalFieldUpdatedValue(current.notice, updated.notice),
    gender: getNullableFieldUpdatedValue(current.gender, updated.gender),
  };
}

const PersonalDetails: React.FC<Props> = ({
  id,
  name,
  email,
  image,
  phone,
  city,
  gender,
  forStudent,
  verifiedEmail,
  verifiedPhone,
  notice,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const validators = useMakeValidators<Form>({
    name: { required: !!name, validate: validateUserName },
    email: { required: true, validate: validateEmail },
    phone: { required: false, validate: validatePhone },
    notice: { required: false, validate: validateNotice },
  });

  const form = useForm<Form>({
    defaults: {
      name: name || "",
      phone: phone || "",
      email,
      city,
      gender,
      notice,
    },
    validators,
    onSubmit: (data) => {
      mutation.mutate({
        id: id,
        payload: asUpdatePayload(
          { name, phone, email, city, notice, gender },
          data
        ),
      });
    },
  });

  const unchanged = useMemo(
    () =>
      isEmptyObject(
        asUpdatePayload(
          { name, phone, email, city, notice, gender },
          form.state
        )
      ),
    [city, email, form.state, gender, name, notice, phone]
  );

  useBlock(!unchanged);

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    if (!forStudent) invalidateQuery([QueryKey.FindTutorMeta, id]);
  }, [invalidateQuery, id, forStudent]);

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
      {
        label: intl(
          forStudent ? "labels.gender.male-student" : "labels.gender.male-tutor"
        ),
        value: IUser.Gender.Male,
      },
      {
        label: intl(
          forStudent
            ? "labels.gender.female-student"
            : "labels.gender.female-tutor"
        ),
        value: IUser.Gender.Female,
      },
    ],
    [intl, forStudent]
  );

  const noticeHelper = useMemo(() => {
    if (form.errors.notice) return form.errors.notice;
    if (!form.state.notice) return intl("labels.notice.helper");
    return intl("labels.notice.helper-with-duration", {
      duration: formatMinutes(form.state.notice),
    });
  }, [form.errors.notice, form.state.notice, intl]);

  return (
    <div>
      <div
        data-student={forStudent}
        className="hidden data-[student=true]:hidden data-[student=true]:md:block"
      >
        <UploadPhoto id={id} name={name} image={image} />
      </div>

      <Typography
        data-student={forStudent}
        tag="h2"
        className="hidden md:block text-subtitle-1 font-bold text-natural-950 mb-4 md:mb-6 data-[student=false]:block"
      >
        {intl("tutor-settings.tabs.personal-settings")}
      </Typography>

      <form
        onSubmit={form.onSubmit}
        className="flex flex-wrap md:flex-nowrap gap-6 md:gap-10 md:mt-6"
      >
        <div className="w-full md:w-[320px] lg:w-[400px] flex-shrink-0">
          <div className="w-full flex flex-col gap-2 md:gap-4">
            <div
              data-student={forStudent}
              className="hidden data-[student=true]:block"
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
            </div>

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
              disabled={!forStudent}
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
              dir="ltr"
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

            {!forStudent ? (
              <NumericInput
                id="notice"
                name="notice"
                value={optional(form.state.notice)}
                onValueChange={({ floatValue }) =>
                  form.set("notice", floatValue || 0)
                }
                dir="rtl"
                label={intl("labels.notice")}
                placeholder={intl("labels.notice.placeholder")}
                state={form.errors?.notice ? "error" : undefined}
                helper={noticeHelper}
                autoComplete="off"
                thousandSeparator=","
              />
            ) : null}
          </div>
          <Button
            size="large"
            disabled={mutation.isPending || unchanged}
            loading={mutation.isPending}
            className="mt-6"
            htmlType="submit"
          >
            {intl("shared-settings.save")}
          </Button>
        </div>

        <div className="max-w-[320px] lg:max-w-[640px] flex flex-col gap-6">
          <ConfirmContactMethod
            forStudent={forStudent}
            verifiedEmail={verifiedEmail}
            verifiedPhone={verifiedPhone}
            phone={phone}
          />
        </div>
      </form>
    </div>
  );
};

export default PersonalDetails;
