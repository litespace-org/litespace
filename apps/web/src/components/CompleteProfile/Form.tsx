import { IUser } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useUserContext } from "@litespace/headless/context/user";
import { useToast } from "@litespace/ui/Toast";
import { useNavigate } from "react-router-dom";
import { Route } from "@/types/routes";
import { governorates } from "@/constants/user";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useUpdateUser } from "@litespace/headless/user";
import {
  useValidatePassword,
  useValidatePhoneNumber,
  useValidateUserName,
} from "@litespace/ui/hooks/validation";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Controller, Form } from "@litespace/ui/Form";
import { Button } from "@litespace/ui/Button";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

type IForm = {
  name: string;
  phoneNumber: string;
  city: IUser.City;
  password: string;
};

function getOptionalNullableField<T>(
  current: T | null,
  future: T
): T | null | undefined {
  // User entered a new value and it doesn't match his current one.
  if (future && future !== current) return future;
  // User entered a new value and it is the same as his one.
  if (future === current) return undefined;
  // User removed the current value
  if (!future) return null;
  return undefined;
}

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const intl = useFormatMessage();

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

  const goRoot = useCallback(() => navigate(Route.Root), [navigate]);

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    goRoot();
  }, [invalidateQuery, goRoot]);

  const onError = useCallback(
    (error: unknown) => {
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
      if (!user) return navigate(Route.Login);
      updateUser.mutate({
        id: user.id,
        payload: {
          name: getOptionalNullableField(user.name, data.name.trim()),
          phoneNumber: getOptionalNullableField(
            user.phoneNumber,
            data.phoneNumber.trim()
          ),
          city: getOptionalNullableField(user.city, data.city),
          password: password ? { new: password, current: null } : undefined,
        },
      });
    },
    [navigate, password, updateUser, user]
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col mx-auto gap-6 max-w-[404px]">
        <div className="flex flex-col gap-4">
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
            helper={errors.phoneNumber?.message}
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
