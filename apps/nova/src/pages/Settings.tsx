import PageContent from "@/components/Common/PageContent";
import PageTitle from "@/components/Common/PageTitle";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { Route } from "@/types/routes";
import Eye from "@litespace/assets/Eye";
import EyeSlash from "@litespace/assets/EyeSlash";
import { useUpdateUser } from "@litespace/headless/user";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Controller, Form, Label } from "@litespace/luna/Form";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useUpdateProfileMedia } from "@litespace/luna/hooks/user";
import {
  useValidateEmail,
  useValidatePassword,
  useValidatePhoneNumber,
  useValidateUsername,
} from "@litespace/luna/hooks/validation";
import { InputType } from "@litespace/luna/Input";
import { useToast } from "@litespace/luna/Toast";
import { Typography } from "@litespace/luna/Typography";
import { orNull } from "@litespace/sol/utils";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

type IForm = {
  name: string;
  email: string;
  phoneNumber: string;
  password: {
    new: string;
    current: string;
    confirm: string;
  };
};

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.full);
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isPwdHidden, setIsPwdHidden] = useState({
    current: true,
    new: true,
    confirm: true,
  });

  const form = useForm<IForm>({
    defaultValues: {
      name: profile.value?.user.name || "",
      email: profile.value?.user.email || "",
      phoneNumber: profile.value?.user?.phoneNumber || "",
      password: {
        new: "",
        current: "",
      },
    },
  });
  const validateUsername = useValidateUsername();
  const validateEmail = useValidateEmail();
  const validatePhoneNumber = useValidatePhoneNumber();
  const validatePassword = useValidatePassword();

  useEffect(() => {
    if (token) return;
    const searchParamToken = searchParams.get("token");
    if (!searchParamToken) return navigate(Route.Root);
    setToken(searchParamToken);
    setSearchParams({});
  }, [navigate, searchParams, setSearchParams, token]);

  const onSuccess = useCallback(() => {
    alert("refresh");
  }, []);

  const onError = useCallback(
    (error: Error) => {
      toast.error({
        title: intl("profile.update.error"),
        description: error.message,
      });
    },
    [intl, toast]
  );

  const refresh = useCallback(() => {
    // refresh
  }, []);

  const mediaMutation = useUpdateProfileMedia(refresh, profile.value?.user.id);
  const mutation = useUpdateUser({ onSuccess, onError });

  const onSubmit = useCallback(
    (data: IForm) => {
      if (photo) mediaMutation.mutate({ image: photo });
      if (!profile.value?.user) return;

      mutation.mutate({
        id: profile.value.user.id,
        payload: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: {
            new: data.password.new,
            current: data.password.current,
          },
        },
      });
    },
    [mediaMutation, mutation, photo, profile.value?.user]
  );

  return (
    <div className="max-w-screen-lg mx-auto w-full">
      <div className="w-full">
        <div className="mb-8">
          <PageTitle
            title={intl("settings.profile.title")}
            fetching={profile.fetching && !profile.loading}
          />
        </div>

        <PageContent>
          <Form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-28 p-14"
          >
            <div className="min-w-[38%] flex flex-col gap-6">
              <UploadPhoto
                setPhoto={setPhoto}
                photo={photo || orNull(profile.value?.user.image)}
              />
              <Typography
                element="subtitle-1"
                weight="bold"
                className="text-natural-950"
              >
                {intl("settings.edit.personal.title")}
              </Typography>
              <div>
                <Label>{intl("settings.edit.personal.name")}</Label>
                <Controller.Input
                  placeholder={intl("settings.edit.personal.name.placeholder")}
                  value={form.watch("name")}
                  control={form.control}
                  rules={{ validate: validateUsername }}
                  autoComplete="off"
                  name="name"
                />
              </div>
              <div>
                <Label>{intl("settings.edit.personal.email")}</Label>
                <Controller.Input
                  control={form.control}
                  name="email"
                  value={form.watch("email")}
                  placeholder={intl("settings.edit.personal.email.placeholder")}
                  autoComplete="off"
                  defaultDir="ltr"
                  rules={{ validate: validateEmail }}
                />
              </div>
              <div>
                <Label>{intl("settings.edit.personal.phone-number")}</Label>
                <Controller.PatternInput
                  format="01# #### ####"
                  placeholder={intl(
                    "settings.edit.personal.phone-number.placeholder"
                  )}
                  value={form.watch("phoneNumber")}
                  control={form.control}
                  name="phoneNumber"
                  rules={{ validate: validatePhoneNumber }}
                  autoComplete="off"
                  allowEmptyFormatting
                  mask="#"
                />
              </div>
            </div>
            <div className="min-w-[38%] flex flex-col gap-6">
              <Typography
                element="subtitle-1"
                weight="bold"
                className="text-natural-950"
              >
                {intl("settings.edit.password.title")}
              </Typography>
              <div>
                <Label>{intl("settings.edit.password.current")}</Label>
                <Controller.Input
                  startActions={[
                    {
                      id: 1,
                      Icon: () =>
                        isPwdHidden.current ? <Eye /> : <EyeSlash />,
                      onClick: () =>
                        setIsPwdHidden((prev) => ({
                          ...prev,
                          current: !prev.current,
                        })),
                    },
                  ]}
                  placeholder={intl(
                    "settings.edit.password.current.placeholder"
                  )}
                  value={form.watch("password.current")}
                  control={form.control}
                  rules={{ validate: validatePassword }}
                  autoComplete="off"
                  name="password.current"
                  type={
                    isPwdHidden.current ? InputType.Password : InputType.Text
                  }
                />
              </div>
              <div>
                <Label>{intl("settings.edit.password.new")}</Label>
                <Controller.Input
                  startActions={[
                    {
                      id: 1,
                      Icon: () => (isPwdHidden.new ? <Eye /> : <EyeSlash />),
                      onClick: () => {
                        setIsPwdHidden((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }));
                      },
                    },
                  ]}
                  placeholder={intl("settings.edit.password.new.placeholder")}
                  value={form.watch("password.new")}
                  control={form.control}
                  rules={{ validate: validatePassword }}
                  autoComplete="off"
                  name="password.new"
                  type={isPwdHidden.new ? InputType.Password : InputType.Text}
                />
              </div>
              <div>
                <Label>{intl("settings.edit.password.confirm")}</Label>
                <Controller.Input
                  value={form.watch("password.confirm")}
                  control={form.control}
                  rules={{
                    validate: (value) => {
                      if (value !== form.watch("password.new"))
                        return intl("settings.edit.password.confirm.not-same");
                      return validatePassword(value);
                    },
                  }}
                  autoComplete="off"
                  name="password.confirm"
                  type={
                    isPwdHidden.confirm ? InputType.Password : InputType.Text
                  }
                  placeholder={intl(
                    "settings.edit.password.confirm.placeholder"
                  )}
                  startActions={[
                    {
                      id: 1,
                      Icon: () =>
                        isPwdHidden.confirm ? <Eye /> : <EyeSlash />,
                      onClick: () =>
                        setIsPwdHidden((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        })),
                    },
                  ]}
                />
              </div>

              <Button
                disabled={false}
                size={ButtonSize.Large}
                className="mr-auto"
                htmlType="submit"
              >
                {intl("settings.save")}
              </Button>
            </div>
          </Form>
        </PageContent>
      </div>
    </div>
  );
};

export default Settings;
