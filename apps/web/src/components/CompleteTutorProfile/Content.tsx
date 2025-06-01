import { governorates } from "@/constants/user";
import { useUpdateUser } from "@litespace/headless/user";
import { IUser, Void } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input } from "@litespace/ui/Input";
import { PatternInput } from "@litespace/ui/PatternInput";
import { useToast } from "@litespace/ui/Toast";
import { Typography } from "@litespace/ui/Typography";
import { Web } from "@litespace/utils/routes";
import React, { useMemo } from "react";
import { useForm } from "@litespace/headless/form";
import { useNavigate } from "react-router-dom";
import Check from "@litespace/assets/Check16X16";
import Logo from "@litespace/assets/Logo";
import { Button } from "@litespace/ui/Button";
import { Textarea } from "@litespace/ui/Textarea";
import { Select } from "@litespace/ui/Select";
import {
  validateEmail,
  validatePhone,
  validateTutorAbout,
  validateTutorBio,
  validateUserBirthYear,
  validateUserName,
} from "@litespace/ui/lib/validate";
import { LocalId } from "@litespace/ui/locales";
import { MAX_TUTOR_ABOUT_TEXT_LENGTH, optional } from "@litespace/utils";
import { useOnError } from "@/hooks/error";
import { VerifyEmail } from "@/components/Common/VerifyEmail";
import VerifyPhone from "@/components/Common/VerifyPhone";
import { useRender } from "@litespace/headless/common";

type Form = {
  name: string;
  phone: string;
  email: string;
  city: IUser.City | null;
  gender: IUser.Gender | null;
  birthYear: number;
  about: string;
  bio: string;
};

const GENGER_TO_TUTOR_LABLE: Record<IUser.Gender, LocalId> = {
  [IUser.Gender.Male]: "labels.gender.male-tutor",
  [IUser.Gender.Female]: "labels.gender.female-tutor",
};

const Content: React.FC<{
  refetch: Void;
  tutorId: number;
  name: string | null;
  phone: string | null;
  email: string;
  city: IUser.City | null;
  gender: IUser.Gender | null;
  birthYear: number | null;
  about: string | null;
  bio: string | null;
  verifiedPhone: boolean;
  verifiedEmail: boolean;
}> = ({
  refetch,
  tutorId,
  name,
  phone,
  email,
  city,
  gender,
  birthYear,
  about,
  bio,
  verifiedPhone,
  verifiedEmail,
}) => {
  // ==================== states & hooks ====================
  const verifyEmailDialog = useRender();
  const verifyPhoneDialog = useRender();
  const intl = useFormatMessage();
  const navigate = useNavigate();
  const toast = useToast();

  const onError = useOnError({
    type: "mutation",
    handler({ messageId }) {
      toast.error({
        title: intl("complete-tutor-profile.update-error"),
        description: intl(messageId),
      });
    },
  });

  const update = useUpdateUser({
    onSuccess: () => {
      refetch();
      navigate(Web.Root);
    },
    onError,
  });

  const cityOptions = useMemo(
    () =>
      Object.entries(governorates).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const genderOptions = useMemo(
    () =>
      [IUser.Gender.Male, IUser.Gender.Female].map((gender) => ({
        label: intl(GENGER_TO_TUTOR_LABLE[gender]),
        value: gender,
      })),
    [intl]
  );

  // ==================== form ====================
  const validators = useMakeValidators<Form>({
    name: { required: true, validate: validateUserName },
    phone: {
      required: true,
      validate: (phone) => {
        const messageId = validatePhone(phone);
        if (messageId !== null) return messageId;
        if (!verifiedPhone) return "complete-tutor-profile.phone.not-verified";
        return null;
      },
    },
    email: {
      required: true,
      validate: (email) => {
        const messageId = validateEmail(email);
        if (messageId !== null) return messageId;
        if (!verifiedEmail) return "complete-tutor-profile.email.not-verified";
        return null;
      },
    },
    city: { required: true },
    gender: { required: true },
    birthYear: { required: true, validate: validateUserBirthYear },
    about: { required: true, validate: validateTutorAbout },
    bio: { required: true, validate: validateTutorBio },
  });

  const form = useForm<Form>({
    defaults: {
      name: name || "",
      phone: phone || "",
      birthYear: birthYear || 0,
      about: about || "",
      bio: bio || "",
      email,
      city,
      gender,
    },
    validators,
    onSubmit(data) {
      update.mutate({
        id: tutorId,
        payload: {
          name: data.name,
          phone: data.phone,
          city: data.city,
          gender: data.gender,
          birthYear: data.birthYear,
          about: data.about,
          bio: data.bio,
        },
      });
    },
    validationDeps: [verifiedEmail, verifiedPhone],
  });

  return (
    <div className="gap-10 flex flex-col items-center justify-center self-center h-full">
      <div
        dir="ltr"
        className="flex flex-row gap-4 mb-1 items-center justify-center"
      >
        <Logo className="w-14 h-14 fill-brand-500" />
        <Typography tag="span" className="text-h4 text-brand-700 font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 items-center text-center">
        <Typography tag="h1" className="text-subtitle-1 font-bold">
          {intl("complete-tutor-profile.title")}
        </Typography>
        <Typography tag="p" className="text-body font-normal">
          {intl("complete-tutor-profile.description")}
        </Typography>
      </div>

      <form
        className="flex flex-col items-center md:items-start justify-start gap-10 w-full"
        onSubmit={form.onSubmit}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 md:gap-10 w-full">
          <div className="w-full md:flex-1 flex flex-col gap-4">
            <Input
              id="name"
              name="name"
              idleDir="rtl"
              value={form.state.name}
              inputSize="large"
              label={intl("labels.name")}
              placeholder={intl("labels.name.placeholder")}
              state={form.errors.name ? "error" : undefined}
              helper={form.errors.name}
              onChange={({ target }) => form.set("name", target.value)}
              disabled={update.isPending}
              autoComplete="off"
            />

            <div className="flex items-end w-full gap-2">
              <PatternInput
                id="phone"
                mask=" "
                idleDir="ltr"
                inputSize="large"
                name="phone"
                label={intl("labels.phone")}
                format="### #### ####"
                placeholder={intl("labels.phone.placeholder")}
                state={form.errors.phone ? "error" : undefined}
                helper={form.errors.phone}
                value={form.state.phone}
                autoComplete="off"
                onValueChange={({ value }) => form.set("phone", value)}
                disabled={update.isPending || verifiedPhone}
                post={
                  verifiedPhone ? (
                    <div className="h-10 flex items-center justify-center ms-2">
                      <Check className="w-6 [&>*]:stroke-brand-700" />
                    </div>
                  ) : (
                    <Button
                      className="flex-shrink-0 ms-2"
                      type="natural"
                      variant="primary"
                      size="large"
                      htmlType="button"
                      onClick={verifyPhoneDialog.show}
                      loading={false}
                      disabled={update.isPending}
                    >
                      <Typography tag="span" className="text-body font-medium">
                        {intl("labels.phone.confirm")}
                      </Typography>
                    </Button>
                  )
                }
              />
            </div>

            <div className="flex items-end w-full gap-2">
              <Input
                id="email"
                name="email"
                idleDir="rtl"
                value={form.state.email}
                inputSize="large"
                autoComplete="off"
                helper={form.errors.email}
                label={intl("labels.email")}
                state={form.errors.email ? "error" : undefined}
                onChange={({ target }) => form.set("email", target.value)}
                placeholder={intl("labels.email.placeholder")}
                disabled
                post={
                  verifiedEmail ? (
                    <div className="h-10 flex items-center justify-center ms-2">
                      <Check className="w-6 [&>*]:stroke-brand-700" />
                    </div>
                  ) : (
                    <Button
                      className="flex-shrink-0 ms-2"
                      type="natural"
                      variant="primary"
                      size="large"
                      htmlType="button"
                      onClick={verifyEmailDialog.show}
                      loading={false}
                      disabled={update.isPending}
                    >
                      <Typography tag="span" className="text-body font-medium">
                        {intl("labels.email.confirm")}
                      </Typography>
                    </Button>
                  )
                }
              />
            </div>

            <Select
              id="city"
              value={optional(form.state.city)}
              options={cityOptions}
              label={intl("labels.city")}
              placeholder={intl("labels.city.placeholder")}
              onChange={(city) => form.set("city", city)}
              disabled={update.isPending}
            />

            <Select
              id="gender"
              value={optional(form.state.gender)}
              options={genderOptions}
              label={intl("labels.gender")}
              placeholder={intl("labels.gender.tutor-placeholder")}
              onChange={(gender) => form.set("gender", gender)}
              disabled={update.isPending}
            />

            <PatternInput
              id="birthYear"
              mask=" "
              idleDir="rtl"
              inputSize="large"
              name="birthYear"
              format="####"
              label={intl("labels.birth-year")}
              placeholder={intl("labels.birth-year.placeholder")}
              state={form.errors.birthYear ? "error" : undefined}
              helper={form.errors.birthYear}
              value={optional(form.state.birthYear)}
              autoComplete="off"
              onValueChange={({ value }) =>
                form.set("birthYear", Number(value))
              }
              disabled={update.isPending}
            />
          </div>

          <div className="w-full md:flex-1 flex flex-col gap-4">
            <Input
              id="bio"
              name="bio"
              idleDir="rtl"
              inputSize={"large"}
              label={intl("labels.bio")}
              placeholder={intl("labels.bio.placeholder")}
              state={form.errors.bio ? "error" : undefined}
              helper={form.errors.bio}
              onChange={({ target }) => form.set("bio", target.value)}
              disabled={update.isPending}
              value={form.state.bio}
              autoComplete="off"
            />
            <Textarea
              className="min-h-[250px]"
              id="about"
              name="about"
              idleDir="rtl"
              value={form.state.about}
              label={intl("labels.about")}
              placeholder={intl("labels.about.placeholder")}
              state={
                form.errors.about ||
                form.state.about.length > MAX_TUTOR_ABOUT_TEXT_LENGTH
                  ? "error"
                  : undefined
              }
              helper={form.errors.about}
              onChange={({ target }) => form.set("about", target.value)}
              disabled={update.isPending}
              autoComplete="off"
              maxAllowedCharacters={MAX_TUTOR_ABOUT_TEXT_LENGTH}
            />
          </div>
        </div>

        <Button
          type="main"
          variant="primary"
          size="large"
          htmlType="submit"
          disabled={update.isPending}
          loading={update.isPending}
        >
          <Typography tag="span" className="text-body font-medium">
            {intl("shared-settings.save")}
          </Typography>
        </Button>
      </form>

      <VerifyEmail
        open={verifyEmailDialog.open}
        close={verifyEmailDialog.hide}
      />

      <VerifyPhone
        open={verifyPhoneDialog.open}
        close={verifyPhoneDialog.hide}
        phone={!validatePhone(form.state.phone) ? form.state.phone : null}
      />
    </div>
  );
};

export default Content;
