import { IUser } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useUser } from "@litespace/headless/context/user";
import { useToast } from "@litespace/ui/Toast";
import { useNavigate } from "react-router-dom";
import { governorates } from "@/constants/user";
import { useInvalidateQuery } from "@litespace/headless/query";
import { QueryKey } from "@litespace/headless/constants";
import { useUpdateUser } from "@litespace/headless/user";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import {
  validatePassword,
  validatePhone,
  validateUserName,
} from "@litespace/ui/lib/validate";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import { getNullableFiledUpdatedValue } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import { useOnError } from "@/hooks/error";
import { useForm } from "@litespace/headless/form";
import { Input, Password } from "@litespace/ui/Input";
import { Select } from "@litespace/ui/Select";
import { PatternInput } from "@litespace/ui/PatternInput";
import { Form } from "@litespace/ui/Form";

type IForm = {
  name: string;
  phone: string;
  city?: IUser.City;
  password: string;
};

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const intl = useFormatMessage();

  const toast = useToast();
  const { user } = useUser();
  const invalidateQuery = useInvalidateQuery();

  // ============= Form ==============
  const validators = useMakeValidators<IForm>({
    name: { validate: validateUserName },
    phone: { validate: validatePhone },
    password: { validate: validatePassword },
  });

  const form = useForm<IForm>({
    defaults: {
      name: user?.name || "",
      phone: user?.phone || "",
      city: user?.city || undefined,
      password: "",
    },
    validators,
    onSubmit: (data) => {
      if (!user) return;
      updateUser.mutate({
        id: user.id,
        payload: {
          name: getNullableFiledUpdatedValue(user.name, data.name.trim()),
          phone: getNullableFiledUpdatedValue(user.phone, data.phone.trim()),
          city: getNullableFiledUpdatedValue(user.city, data.city),
          password: data.password
            ? { new: data.password, current: null }
            : undefined,
        },
      });
    },
  });

  // ============= Complete Profile Mutation ==============
  const goRoot = useCallback(() => navigate(Web.Root), [navigate]);
  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    goRoot();
  }, [invalidateQuery, goRoot]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("complete-profile.update.error"),
        description: intl(messageId),
      });
    },
  });

  const updateUser = useUpdateUser({ onSuccess, onError });

  const cityOptions = useMemo(
    () =>
      Object.entries(governorates).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  return (
    <Form onSubmit={form.onSubmit} className="w-full max-w-[448px]">
      <div className="flex flex-col mx-auto gap-6">
        <div className="flex flex-col gap-2 sm:gap-4">
          <Input
            id="name"
            name="name"
            idleDir="rtl"
            value={form.state.name}
            inputSize={"large"}
            autoComplete="off"
            onChange={(e) => form.set("name", e.target.value)}
            label={intl("labels.name")}
            placeholder={intl("labels.name.placeholder")}
            state={form.errors.name ? "error" : undefined}
            helper={form.errors.name}
          />

          <PatternInput
            mask=" "
            id="phone"
            idleDir="ltr"
            inputSize="large"
            name="phone"
            value={form.state.phone}
            onChange={(e) => form.set("phone", e.target.value)}
            format="### #### ####"
            label={intl("labels.phone")}
            placeholder={intl("labels.phone.placeholder")}
            state={form.errors.phone ? "error" : undefined}
            helper={form.errors.phone || intl("complete-profile.phone.helper")}
            autoComplete="off"
          />

          <Select
            id="city"
            value={form.state.city}
            onChange={(value) => form.set("city", value)}
            options={cityOptions}
            label={intl("labels.city")}
            placeholder={intl("labels.city.placeholder")}
            helper={form.errors.city || intl("complete-profile.city.helper")}
          />

          {!user?.password ? (
            <Password
              idleDir="rtl"
              id="password"
              name="password"
              onChange={(e) => form.set("password", e.target.value)}
              value={form.state.password}
              inputSize="large"
              label={intl("labels.password")}
              state={form.errors.password ? "error" : undefined}
              placeholder={intl("labels.create-password.placeholder")}
              helper={form.errors.password}
            />
          ) : null}
        </div>
        <div className="flex gap-4 items-center">
          <Button
            type="main"
            size="large"
            htmlType="submit"
            className="w-full text"
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
            className="w-full text"
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
