import { timePeriods } from "@/constants/user";
import { useOnError } from "@/hooks/error";
import { QueryKey } from "@litespace/headless/constants";
import { useUser } from "@litespace/headless/context/user";
import { useForm } from "@litespace/headless/form";
import { useInvalidateQuery } from "@litespace/headless/query";
import { useUpdateUser } from "@litespace/headless/user";
import { useUpdateStudent } from "@litespace/headless/student";
import { IUser, Void } from "@litespace/types";
import { Button } from "@litespace/ui/Button";
import { Form } from "@litespace/ui/Form";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useMakeValidators } from "@litespace/ui/hooks/validation";
import { Input, Password } from "@litespace/ui/Input";
import {
  validatePassword,
  validatePhone,
  validateUserName,
} from "@litespace/ui/lib/validate";
import { PatternInput } from "@litespace/ui/PatternInput";
import { Select } from "@litespace/ui/Select";
import { useToast } from "@litespace/ui/Toast";
import { getNullableFieldUpdatedValue } from "@litespace/utils";
import React, { useCallback, useMemo } from "react";

type IForm = {
  name: string;
  phone: string;
  timePeriod?: IUser.TimePeriod;
  password: string;
};

const MainInfo: React.FC<{ next: Void }> = ({ next }) => {
  const { user } = useUser();
  const intl = useFormatMessage();
  const toast = useToast();
  const invalidateQuery = useInvalidateQuery();

  // ============= Complete Profile Mutation ==============
  const timePeriodOptions = useMemo(
    () =>
      Object.entries(timePeriods).map(([key, value]) => ({
        label: intl(value),
        value: Number(key),
      })),
    [intl]
  );

  const onSuccess = useCallback(() => {
    invalidateQuery([QueryKey.FindCurrentUser]);
    next();
  }, [invalidateQuery, next]);

  const onError = useOnError({
    type: "mutation",
    handler: ({ messageId }) => {
      toast.error({
        title: intl("complete-profile.update.error"),
        description: intl(messageId),
      });
    },
  });

  // @galal TODO: use useUpdateStudent once the backend the done.
  const updateUser = useUpdateUser({ onSuccess, onError });
  const updateStudent = useUpdateStudent({ onSuccess, onError });

  // ============= Form ==============
  const validators = useMakeValidators<IForm>({
    name: { validate: validateUserName },
    phone: { validate: validatePhone },
    password: { required: false, validate: validatePassword },
  });

  const form = useForm<IForm>({
    defaults: {
      name: user?.name || "",
      phone: user?.phone || "",
      timePeriod: undefined,
      password: "",
    },
    validators,
    onSubmit: (data) => {
      if (!user) return;
      updateUser.mutate({
        id: user.id,
        payload: {
          name: getNullableFieldUpdatedValue(user.name, data.name.trim()),
          phone: getNullableFieldUpdatedValue(user.phone, data.phone.trim()),
          password: data.password
            ? { new: data.password, current: null }
            : undefined,
        },
      });
      updateStudent.mutate({
        payload: {
          id: user.id,
          timePeriod: data.timePeriod,
        },
      });
    },
  });

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
            onValueChange={(e) => form.set("phone", e.value)}
            format="### #### ####"
            label={intl("labels.phone")}
            placeholder={intl("labels.phone.placeholder")}
            state={form.errors.phone ? "error" : undefined}
            helper={form.errors.phone || intl("complete-profile.phone.helper")}
            autoComplete="off"
          />

          <Select
            id="timePeriod"
            value={form.state.timePeriod}
            onChange={(value) => form.set("timePeriod", value)}
            options={timePeriodOptions}
            label={intl("labels.time-period")}
            placeholder={intl("labels.time-period.placeholder")}
            helper={form.errors.timePeriod}
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
            onClick={next}
            htmlType="button"
            className="w-full text"
            variant="secondary"
            disabled={updateStudent.isPending}
          >
            {intl("labels.skip")}
          </Button>
          <Button
            type="main"
            size="large"
            htmlType="submit"
            className="w-full text"
            disabled={updateStudent.isPending}
            loading={updateStudent.isPending}
          >
            {intl("labels.next")}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default MainInfo;
