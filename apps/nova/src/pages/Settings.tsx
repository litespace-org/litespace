import PageContent from "@/components/Common/PageContent";
import PageTitle from "@/components/Common/PageTitle";
import UploadPhoto from "@/components/Settings/UploadPhoto";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { useUpdateUser } from "@litespace/headless/user";
import { Button, ButtonSize } from "@litespace/luna/Button";
import { Controller, Form, Label } from "@litespace/luna/Form";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useUpdateProfileMedia } from "@litespace/luna/hooks/user";
import {
  useValidateEmail,
  useValidatePhoneNumber,
  useValidateUsername,
} from "@litespace/luna/hooks/validation";
import { useToast } from "@litespace/luna/Toast";
import { Typography } from "@litespace/luna/Typography";
import { orNull } from "@litespace/sol/utils";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

type IForm = {
  name: string;
  email: string;
  phoneNumber: string;
};

const Settings: React.FC = () => {
  const intl = useFormatMessage();
  const toast = useToast();
  const profile = useAppSelector(profileSelectors.full);
  const [photo, setPhoto] = useState<File | null>(null);
  const form = useForm<IForm>({
    defaultValues: {
      name: profile.value?.user.name || "",
      email: profile.value?.user.email || "",
      phoneNumber: profile.value?.user?.phoneNumber || "",
    },
  });
  const validateUsername = useValidateUsername();
  const validateEmail = useValidateEmail();
  const validatePhoneNumber = useValidatePhoneNumber();

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

  const mutation = useUpdateUser({ onSuccess, onError });
  const mediaMutation = useUpdateProfileMedia(refresh, profile.value?.user.id);
  const onSubmit = useCallback(
    (data: IForm) => {
      if (!profile.value?.user) return;
      mutation.mutate({ id: profile.value?.user.id, payload: data });
    },
    [mutation, profile.value?.user]
  );

  const handleSave = useCallback(() => {
    if (!photo) return;
    mediaMutation.mutate({ image: photo });
  }, [mediaMutation, photo]);

  return (
    <div className="max-w-screen-lg mx-auto w-full">
      <div className="w-full">
        <div className="mb-8">
          <PageTitle
            title={intl("settings.profile.title")}
            fetching={profile.fetching && !profile.loading}
          />
        </div>

        <PageContent className="flex flex-col gap-8 p-14">
          <UploadPhoto
            setPhoto={setPhoto}
            photo={photo || orNull(profile.value?.user.image)}
          />
          <Form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6 max-w-[400px]">
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
            <Button
              disabled={false}
              size={ButtonSize.Large}
              className="mr-auto"
              htmlType="submit"
              onClick={handleSave}
            >
              {intl("settings.save")}
            </Button>
          </Form>
        </PageContent>
      </div>
    </div>
  );
};

export default Settings;
