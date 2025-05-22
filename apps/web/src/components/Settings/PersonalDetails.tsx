import UploadPhoto from "@/components/StudentSettings/UploadPhoto";
import { Input } from "@litespace/ui/Input";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Select } from "@litespace/ui/Select";
import { governorates } from "@/constants/user";
import React, { useCallback, useMemo } from "react";
import { Button } from "@litespace/ui/Button";
import { IUser, ITutor } from "@litespace/types";
import { useForm } from "@litespace/headless/form";
import {
  getNullableFiledUpdatedValue,
  getOptionalFieldUpdatedValue,
  optional,
} from "@litespace/utils";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { useUpdateUser } from "@litespace/headless/user";
import { useFindStudios } from "@litespace/headless/studio";
import { useToast } from "@litespace/ui/Toast";
import { useOnError } from "@/hooks/error";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { PatternInput } from "@litespace/ui/PatternInput";
import { ConfirmContactMethod } from "@/components/Settings/ConfirmContactMethod";
import {
  isValidEmail,
  isValidPhone,
  isValidUserName,
} from "@litespace/ui/lib/validate";
import { Typography } from "@litespace/ui/Typography";
import { Form } from "@litespace/ui/Form";

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
  notice?: ITutor.Self["notice"];
  studio?: ITutor.Self["studioId"];
};

const PersonalDetails: React.FC<Props> = ({
  id,
  name,
  forStudent,
  email,
  image,
  phone,
  city,
  gender,
  verifiedEmail,
  verifiedPhone,
  notice,
  studio,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  const studiosQuery = useFindStudios({});

  const studioOptions = useMemo(
    () =>
      studiosQuery.data?.list.map((studio) => ({
        label: studio.name || "",
        value: studio.id,
      })),
    [studiosQuery]
  );

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
      studio,
      notice: notice || 0,
    },
    validators,
    onSubmit: (data) => {
      const getUpdatePayload = (data: Form) => ({
        name: getNullableFiledUpdatedValue(name, data.name || null),
        phone: getNullableFiledUpdatedValue(phone, data.phone || null),
        email: getOptionalFieldUpdatedValue(email, data.email),
        city: getNullableFiledUpdatedValue(city, data.city),
        notice: getOptionalFieldUpdatedValue(notice, data.notice),
        studioId: getNullableFiledUpdatedValue(studio, data.studio),
        gender: getNullableFiledUpdatedValue(gender, data.gender),
      });

      mutation.mutate({
        id: id,
        payload: getUpdatePayload(data),
      });
    },
  });

  const hasNoChanges = useMemo(() => {
    return (
      (name || "") === form.state.name &&
      (phone || "") === form.state.phone &&
      email === form.state.email &&
      city === form.state.city &&
      gender === form.state.gender &&
      notice === form.state.notice &&
      studio === form.state.studio
    );
  }, [
    city,
    email,
    form.state.city,
    form.state.email,
    form.state.gender,
    form.state.name,
    form.state.phone,
    form.state.studio,
    form.state.notice,
    gender,
    name,
    phone,
    notice,
    studio,
  ]);

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

  const StudentPhotoControl = () => (
    <div className="hidden md:block">
      <UploadPhoto id={id} name={name} image={image} />
    </div>
  );

  const TutorSpecificControl = () => (
    <div className="flex flex-col gap-4 lg:max-w-[422px]">
      <Select
        id="studio"
        value={optional(form.state.studio)}
        onChange={(value) => form.set("studio", value)}
        options={studioOptions}
        label={intl("labels.studio")}
        placeholder={intl("labels.studio.placeholder")}
        state={form.errors.studio ? "error" : undefined}
        helper={form.errors?.studio}
      />
      <Input
        id="notice"
        name="notice"
        value={form.state.notice}
        onChange={(e) => form.set("notice", Number(e.target.value))}
        label={intl("labels.notice")}
        placeholder={intl("labels.notice.placeholder")}
        state={form.errors?.notice ? "error" : undefined}
        helper={form.errors?.notice}
        autoComplete="off"
      />
    </div>
  );

  return (
    <div>
      {forStudent ? <StudentPhotoControl /> : null}
      {!forStudent ? (
        <Typography
          tag="h2"
          className="text-subtitle-1 font-bold text-natural-950 mb-4 md:mb-6"
        >
          {intl("tutor-settings.tabs.personal-settings")}
        </Typography>
      ) : null}{" "}
      <Form
        onSubmit={form.onSubmit}
        className="flex flex-wrap md:flex-nowrap gap-6 md:gap-10 md:mt-6"
      >
        <div className="w-full md:w-[320px] lg:w-[400px] flex-shrink-0">
          <div className="w-full flex flex-col gap-2 md:gap-4">
            {forStudent ? (
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
            ) : null}

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
              dir={"ltr"}
              className="text-right"
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
          </div>
        </div>

        <div className="max-w-[320px] lg:max-w-[640px] flex flex-col gap-6">
          {!forStudent ? <TutorSpecificControl /> : null}{" "}
          <ConfirmContactMethod
            forStudent={forStudent}
            verifiedEmail={verifiedEmail}
            verifiedPhone={verifiedPhone}
          />
        </div>
      </Form>
      <Button
        size="large"
        disabled={mutation.isPending || hasNoChanges}
        loading={mutation.isPending}
        onClick={form.submit}
        className="mt-6 mr-auto lg:mt-10 lg:mr-0"
      >
        {intl("shared-settings.save")}
      </Button>
    </div>
  );
};

export default PersonalDetails;
