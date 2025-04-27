import React, { useCallback, useEffect, useMemo } from "react";
import { Typography } from "@litespace/ui/Typography";
import Logo from "@litespace/assets/Logo";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useUserContext } from "@litespace/headless/context/user";
import { useNavigate } from "react-router-dom";
import {
  isTutor,
  isValidTutorAbout,
  isValidTutorBio,
  isValidUserBirthYear,
  isValidUserName,
} from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { useForm } from "@litespace/headless/form";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { isValidPhone } from "@litespace/ui/lib/validate";
import { Button } from "@litespace/ui/Button";
import { FieldError, IUser } from "@litespace/types";
import { Input } from "@litespace/ui/Input";
import { Textarea } from "@litespace/ui/Textarea";
import { PatternInput } from "@litespace/ui/PatternInput";
import { Select } from "@litespace/ui/Select";
import { genders, governorates } from "@/constants/user";
import Check from "@litespace/assets/Check16X16";
import { isProfileComplete } from "@litespace/utils/tutor";
import { useUpdateUser } from "@litespace/headless/user";
import { useToast } from "@litespace/ui/Toast";

type FormInputs = {
  name: string;
  phone: string;
  city?: IUser.City | null;
  gender?: keyof typeof IUser.NumberGenderMap | null;
  birthYear?: number | null;
  about: string | null;
  bio: string | null;
};

const CompleteTutorProfile: React.FC = () => {
  // ==================== states & hooks ====================
  const intl = useFormatMessage();
  const { user, meta, refetch } = useUserContext();
  const navigate = useNavigate();
  const toast = useToast();

  const mutateTutor = useUpdateUser({
    onSuccess: () => {
      refetch.user();
      refetch.meta();
      navigate(Web.Root);
    },
    onError: () =>
      toast.error({
        title: intl("error.api.unexpected"),
        description: intl("error.unexpected"),
      }),
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
      Object.entries(genders).map(([key, value]) => ({
        label: intl(value),
        value: IUser.GenderNumberMap[key as keyof typeof genders],
      })),
    [intl]
  );

  // ==================== form ====================
  const validators = useMakeValidators<FormInputs>({
    name: {
      required: true,
      validate: (name) => {
        const v = isValidUserName(name);
        if (v === FieldError.InvalidUserName)
          return "error.field.invalid-user-name";
        if (v === FieldError.ShortUserName)
          return "error.field.short-user-name";
        if (v === FieldError.LongUserName) return "error.field.long-user-name";
        return null;
      },
    },
    phone: {
      required: true,
      validate: isValidPhone,
    },
    city: { required: true },
    gender: { required: true },
    birthYear: {
      required: true,
      validate: (year) => {
        const v = isValidUserBirthYear(year || 0);
        if (v === FieldError.OldUser) return "error.field.old-user";
        if (v === FieldError.YoungUser) return "error.field.young-user";
        return null;
      },
    },
    about: {
      required: true,
      validate: (about) => {
        const v = isValidTutorAbout(about || "");
        if (v === FieldError.EmptyTutorAbout)
          return "error.field.empty-tutor-about";
        if (v === FieldError.LongTutorAbout)
          return "error.field.long-tutor-about";
        return null;
      },
    },
    bio: {
      required: true,
      validate: (bio) => {
        const v = isValidTutorBio(bio || "");
        if (v === FieldError.InvalidBio) return "error.field.invalid-bio";
        if (v === FieldError.EmptyBio) return "error.field.empty-bio";
        if (v === FieldError.ShortBio) return "error.field.short-bio";
        if (v === FieldError.LongBio) return "error.field.long-bio";
        return null;
      },
    },
  });

  const form = useForm<FormInputs>({
    defaults: {
      name: user?.name || "",
      phone: user?.phone || "",
      city: user?.city,
      gender: user?.gender ? IUser.GenderNumberMap[user.gender] : undefined,
      birthYear: user?.birthYear,
      about: meta?.about || "",
      bio: meta?.bio || "",
    },
    validators,
    onSubmit(data) {
      if (!user?.id) return;
      mutateTutor.mutate({
        id: user?.id,
        payload: {
          name: data.name,
          phone: data.phone,
          city: data.city,
          gender: data.gender ? IUser.NumberGenderMap[data.gender] : undefined,
          birthYear: data.birthYear || undefined,
          about: data.about,
          bio: data.bio,
        },
      });
    },
  });

  // ==================== effects ====================
  useEffect(() => {
    if (!isTutor(user)) return navigate(Web.Root);
    if (isProfileComplete({ ...user, ...meta })) return navigate(Web.Root);
  }, [user, navigate, meta]);

  // ==================== callbacks ====================
  const confirmPhone = useCallback(() => alert("not implemented yet!"), []);

  return (
    <div className="gap-10 flex flex-col items-center justify-center self-center max-w-[884px] h-full px-10 lg:px-0">
      <div
        dir="ltr"
        className="flex flex-row gap-4 mb-1 items-center justify-center"
      >
        <Logo className="w-14 h-14" />
        <Typography tag="p" className="text-h4 text-brand-700 font-bold">
          {intl("labels.litespace")}
        </Typography>
      </div>

      <div className="flex flex-col gap-4 items-center text-center">
        <Typography tag="h1" className="text-subtitle-1 font-bold">
          {intl("tutor.complete-profile.title")}
        </Typography>
        <Typography tag="p" className="text-body font-normal">
          {intl("tutor.complete-profile.description")}
        </Typography>
      </div>

      <form
        className="flex flex-col items-center md:items-start justify-start gap-10 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 w-full">
          <div className="w-full md:flex-1 flex flex-col gap-4">
            <Input
              id="name"
              name="name"
              idleDir="rtl"
              value={form.state.name}
              inputSize={"large"}
              label={intl("labels.name")}
              placeholder={intl("labels.name.placeholder")}
              state={form.errors.name ? "error" : undefined}
              helper={form.errors.name}
              onChange={({ target }) => form.set("name", target.value)}
              disabled={mutateTutor.isPending}
            />

            <div className="flex flex-col gap-1">
              <Typography tag="label" className="text-sm font-semibold">
                {intl("labels.phone")}
              </Typography>
              <div className="flex items-center w-full gap-2">
                <PatternInput
                  id="phone"
                  mask=" "
                  idleDir="rtl"
                  inputSize="large"
                  name="phone"
                  format="### #### ####"
                  placeholder={intl("labels.phone.placeholder")}
                  state={form.errors.phone ? "error" : undefined}
                  helper={form.errors.phone}
                  value={form.state.phone}
                  autoComplete="off"
                  disabled={
                    (!!user?.phone && user.verifiedPhone) ||
                    mutateTutor.isPending
                  }
                  onValueChange={({ value }) => form.set("phone", value)}
                />
                {user?.verifiedPhone ? (
                  <Check className="w-6 [&>*]:stroke-brand-700" />
                ) : (
                  <Button
                    className="!w-1/2"
                    type="main"
                    variant="tertiary"
                    size="large"
                    htmlType="button"
                    onClick={confirmPhone}
                    loading={false}
                    disabled={mutateTutor.isPending}
                  >
                    <Typography tag="span" className="text-body font-medium">
                      {intl("labels.phone.confirm")}
                    </Typography>
                  </Button>
                )}
              </div>
            </div>

            <Select
              id="city"
              value={form.state.city || undefined}
              options={cityOptions}
              label={intl("labels.city")}
              placeholder={intl("labels.city.placeholder")}
              onChange={(city) => form.set("city", city)}
              disabled={mutateTutor.isPending}
            />
            <Select
              id="gender"
              value={form.state.gender || undefined}
              options={genderOptions}
              label={intl("labels.gender")}
              placeholder={intl("labels.gender.placeholder")}
              onChange={(gender) => form.set("gender", gender)}
              disabled={mutateTutor.isPending}
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
              value={form.state.birthYear}
              autoComplete="off"
              onValueChange={({ value }) =>
                form.set("birthYear", Number(value))
              }
              disabled={mutateTutor.isPending}
            />
          </div>

          <div className="w-full md:flex-1 flex flex-col gap-4">
            <Input
              id="about"
              name="about"
              idleDir="rtl"
              value={form.state.about || ""}
              inputSize={"large"}
              label={intl("labels.about")}
              placeholder={intl("labels.about.placeholder")}
              state={form.errors.about ? "error" : undefined}
              helper={form.errors.about}
              onChange={({ target }) => form.set("about", target.value)}
              disabled={mutateTutor.isPending}
            />
            <Textarea
              className="min-h-[267px]"
              id="bio"
              name="bio"
              idleDir="rtl"
              value={form.state.bio || ""}
              label={intl("labels.bio")}
              placeholder={intl("labels.bio.placeholder")}
              state={form.errors.bio ? "error" : undefined}
              helper={form.errors.bio}
              onChange={({ target }) => form.set("bio", target.value)}
              disabled={mutateTutor.isPending}
            />
          </div>
        </div>

        <Button
          type="main"
          variant="primary"
          size="large"
          htmlType="submit"
          disabled={mutateTutor.isPending}
          loading={mutateTutor.isPending}
        >
          <Typography tag="span" className="text-body font-medium">
            {intl("shared-settings.save")}
          </Typography>
        </Button>
      </form>
    </div>
  );
};

export default CompleteTutorProfile;
