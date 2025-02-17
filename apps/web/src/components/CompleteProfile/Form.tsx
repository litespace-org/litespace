import { IUser } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useUserContext } from "@litespace/headless/context/user";
import { useToast } from "@litespace/ui/Toast";
import { useNavigate } from "react-router-dom";
import { governorates } from "@litespace/ui/governorate";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useUpdateUser } from "@litespace/headless/user";
import {
  useValidatePassword,
  useValidatePhoneNumber,
  useValidateUserName,
} from "@litespace/ui/hooks/validation";
import { useWebFormatMessage } from "@/hooks/intl";
import { Controller, Form } from "@litespace/ui/Form";
import { Button } from "@litespace/ui/Button";
import { getErrorMessageId } from "@litespace/ui/errorMessage";
import { getNullableFiledUpdatedValue } from "@litespace/utils";
import { capture } from "@/lib/sentry";
import { Web } from "@litespace/utils/routes";

type IForm = {
  name: string;
  phoneNumber: string;
  city: IUser.City;
  password: string;
};

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const intl = useWebFormatMessage();

  const toast = useToast();
  const { user } = useUserContext();
  const invalidateQuery = useInvalidateQuery();

  const { control, handleSubmit, watch, formState } = useForm<IForm>({
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      city: user?.city || undefined,
      password: "",
    },
  });

  const name = watch("name");
  const phoneNumber = watch("phoneNumber");
  const city = watch("city");
  const password = watch("password");
  const errors = formState.errors;

  const validatePassword = useValidatePassword();
  const validateUserName = useValidateUserName();
  const validatePhoneNumber = useValidatePhoneNumber();

  const goRoot = useCallback(() => navigate(Web.Root), [navigate]);

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    goRoot();
  }, [invalidateQuery, goRoot]);

  const onError = useCallback(
    (error: unknown) => {
      capture(error);
      const errorMessage = getErrorMessageId(error);
      toast.error({
        title: intl("complete-profile.update.error"),
        description: intl(errorMessage),
      });
    },
    [intl, toast]
  );

  const updateUser = useUpdateUser({ onSuccess, onError });

  const cityOptions = useMemo(
    () =>
      Object.entries(governorates).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const onSubmit = useCallback(
    (data: IForm) => {
      if (!user) return;
      updateUser.mutate({
        id: user.id,
        payload: {
          name: getNullableFiledUpdatedValue(user.name, data.name.trim()),
          phoneNumber: getNullableFiledUpdatedValue(
            user.phoneNumber,
            data.phoneNumber.trim()
          ),
          city: getNullableFiledUpdatedValue(user.city, data.city),
          password: data.password
            ? { new: data.password, current: null }
            : undefined,
        },
      });
    },
    [updateUser, user]
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col sm:mx-auto gap-6 sm:max-w-[404px]">
        <div className="flex flex-col gap-2 sm:gap-4">
          <Controller.Input
            id="name"
            name="name"
            idleDir="rtl"
            value={name}
            control={control}
            inputSize={"large"}
            autoComplete="off"
            label={intl("labels.name")}
            rules={{ validate: validateUserName }}
            placeholder={intl("labels.name.placeholder")}
            state={errors.name ? "error" : undefined}
            helper={errors.name?.message}
          />

          <Controller.PatternInput
            mask=" "
            id="phoneNumber"
            control={control}
            idleDir="rtl"
            inputSize="large"
            name="phoneNumber"
            value={phoneNumber}
            format="### #### ####"
            label={intl("labels.phoneNumber")}
            rules={{ validate: validatePhoneNumber }}
            placeholder={intl("labels.phoneNumber.placeholder")}
            state={errors.phoneNumber ? "error" : undefined}
            helper={
              errors.phoneNumber?.message ||
              intl("complete-profile.phone.helper")
            }
            autoComplete="off"
          />

          <Controller.Select
            id="city"
            name="city"
            value={city}
            control={control}
            options={cityOptions}
            label={intl("labels.city")}
            placeholder={intl("labels.city.placeholder")}
            helper={
              errors.city?.message || intl("complete-profile.city.helper")
            }
          />

          {!user?.password ? (
            <Controller.Password
              idleDir="rtl"
              id="password"
              name="password"
              value={password}
              control={control}
              inputSize="large"
              label={intl("labels.password")}
              rules={{ validate: validatePassword }}
              state={errors.password ? "error" : undefined}
              placeholder={intl("labels.password.placeholder")}
              helper={errors.password?.message}
            />
          ) : null}
        </div>
        <div className="flex gap-4 items-center">
          <Button
            type="main"
            size="large"
            htmlType="submit"
            className="w-full"
            disabled={updateUser.isPending}
            loading={updateUser.isPending}
          >
            {intl("labels.confirm")}
          </Button>
          <Button
            type="main"
            size="large"
            onClick={goRoot}
            htmlType="button"
            className="w-full"
            variant="secondary"
            disabled={updateUser.isPending}
          >
            {intl("labels.skip")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default CompleteProfile;
