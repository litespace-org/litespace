import { IUser } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useUserContext } from "@litespace/headless/context/user";
import { useToast } from "@litespace/ui/Toast";
import { useNavigate } from "react-router-dom";
import { orUndefined } from "@litespace/utils/utils";
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
import { Controller, Form, Label } from "@litespace/ui/Form";
import {
  Button,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "@litespace/ui/Button";
import { getErrorMessageId } from "@litespace/ui/errorMessage";

type IForm = {
  name: string;
  phoneNumber: string;
  city: IUser.City;
  password: string;
};

const CompleteInfoForm: React.FC = () => {
  const navigate = useNavigate();
  const intl = useFormatMessage();

  const toast = useToast();
  const { user } = useUserContext();
  const invalidateQuery = useInvalidateQuery();

  const { control, handleSubmit, watch } = useForm<IForm>({
    defaultValues: {
      name: orUndefined(user?.name),
      phoneNumber: orUndefined(user?.phoneNumber),
      city: orUndefined(user?.city),
      password: orUndefined(user?.phoneNumber),
    },
  });

  const name = watch("name");
  const phoneNumber = watch("phoneNumber");
  const city = watch("city");
  const password = watch("password");

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
        title: intl("profile.update.error"),
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

  const onSubmit = (data: IForm) => {
    if (!user) return navigate(Route.Login);
    updateUser.mutate({
      id: user.id,
      payload: {
        ...data,
        password: password
          ? {
              new: password,
              current: null,
            }
          : undefined,
      },
    });
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col mx-auto gap-6 max-w-[404px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Label id="name">{intl("labels.name")}</Label>
            <Controller.Input
              control={control}
              name="name"
              inputSize={"large"}
              value={name}
              rules={{ validate: validateUserName }}
              autoComplete="off"
              placeholder={intl("label.name.placeholder")}
              idleDir="rtl"
            />
          </div>
          <div className="flex flex-col">
            <Label id="phoneNumber">{intl("labels.phoneNumber")}</Label>
            <Controller.Input
              control={control}
              name="phoneNumber"
              inputSize={"large"}
              value={phoneNumber}
              rules={{ validate: validatePhoneNumber }}
              placeholder={intl("label.phoneNumber.placeholder")}
              idleDir="rtl"
            />
          </div>

          <div className="flex flex-col">
            <Label id="city">{intl("labels.city")}</Label>
            <Controller.Select
              control={control}
              className="h-10"
              name="city"
              value={city}
              options={cityOptions}
              placeholder={intl("label.city.placeholder")}
            />
          </div>

          {!user?.password ? (
            <div className="flex flex-col">
              <Label id="password">{intl("labels.password")}</Label>
              <Controller.Password
                control={control}
                inputSize={"large"}
                rules={{ validate: validatePassword }}
                name="password"
                placeholder={intl("label.password.placeholder")}
                value={password}
              />
            </div>
          ) : null}
        </div>
        <div className="flex gap-4 items-center">
          <Button
            htmlType="submit"
            className="grow"
            disabled={updateUser.isPending}
            loading={updateUser.isPending}
            size={ButtonSize.Small}
          >
            {intl("labels.confirm")}
          </Button>
          <Button
            htmlType="button"
            onClick={goRoot}
            className="grow"
            disabled={updateUser.isPending}
            type={ButtonType.Success}
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
          >
            {intl("labels.skip")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default CompleteInfoForm;
