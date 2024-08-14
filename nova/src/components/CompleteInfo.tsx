import { atlas } from "@/lib/atlas";
import { useAppDispatch } from "@/redux/store";
import { setUserProfile } from "@/redux/user/me";
import { Route } from "@/types/routes";
import {
  Button,
  Field,
  Form,
  Input,
  InputType,
  Label,
  messages,
  toaster,
  useValidation,
} from "@litespace/luna";
import { IUser, NumericString } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

type IForm = {
  email: string;
  password: string;
  name: { ar: string; en: string };
  birthYear: NumericString | "";
  gender: string;
};

const CompleteInfo: React.FC<{ profile: IUser.Self }> = ({ profile }) => {
  const intl = useIntl();
  const validation = useValidation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: {
      email: profile.email || "",
      password: "",
      name: { ar: profile.name.ar || "", en: profile.name.en || "" },
      birthYear: "",
      gender: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: IUser.UpdateApiPayload) => {
      return await atlas.user.update(profile.id, payload);
    },
    onSuccess(user) {
      toaster.success({
        title: intl.formatMessage({
          id: messages["page.complete.profile.form.success"],
        }),
      });
      dispatch(setUserProfile(user));
      navigate(Route.Root);
    },
    onError(error) {
      toaster.error({
        title: intl.formatMessage({
          id: messages["page.complete.profile.form.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    mutationKey: "update-user",
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(({ email, password, birthYear, gender, name }) => {
        mutation.mutate({
          password: !isEmpty(password) ? password : undefined,
          email: !isEmpty(email) ? email : undefined,
          birthYear: !isEmpty(birthYear) ? Number(birthYear) : undefined,
          name,
        });
      }),
    [handleSubmit, mutation]
  );

  const fields: IForm = {
    email: watch("email"),
    password: watch("password"),
    name: { ar: watch("name.ar"), en: watch("name.en") },
    birthYear: watch("birthYear"),
    gender: watch("gender"),
  };

  const disabled = useMemo(() => {
    if (
      profile.email &&
      profile.password &&
      profile.name.ar &&
      profile.name.en &&
      !fields.birthYear &&
      !fields.gender
    )
      return true;
    return false;
  }, [
    fields.birthYear,
    fields.gender,
    profile.email,
    profile.name.ar,
    profile.name.en,
    profile.password,
  ]);

  return (
    <div className="min-w-[400px]">
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        {profile.email === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["global.form.email.label"],
                })}
              </Label>
            }
            field={
              <Input
                placeholder={intl.formatMessage({
                  id: messages["global.form.email.placeholder"],
                })}
                value={fields.email}
                register={register("email", validation.email)}
                error={errors["email"]?.message}
                autoComplete="off"
                disabled={mutation.isLoading}
              />
            }
          />
        ) : null}

        {profile.password === false ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["global.form.password.label"],
                })}
              </Label>
            }
            field={
              <Input
                value={fields.password}
                register={register("password", validation.password)}
                type={InputType.Password}
                error={errors["password"]?.message}
                autoComplete="off"
                disabled={mutation.isLoading}
              />
            }
          />
        ) : null}

        {profile.name.ar === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.name.ar.label"],
                })}
              </Label>
            }
            field={
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.complete.profile.form.name.ar.placeholder"
                  ],
                })}
                value={fields.name.ar}
                register={register("name.ar", validation.name.ar)}
                type={InputType.Text}
                error={errors["name"]?.ar?.message}
                autoComplete="off"
                disabled={mutation.isLoading}
              />
            }
          />
        ) : null}

        {profile.name.en === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.name.en.label"],
                })}
              </Label>
            }
            field={
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.complete.profile.form.name.en.placeholder"
                  ],
                })}
                // value={watch("name.en")}
                value={fields.name.en}
                register={register("name.en", validation.name.en)}
                type={InputType.Text}
                error={errors["name"]?.en?.message}
                autoComplete="off"
                disabled={mutation.isLoading}
              />
            }
          />
        ) : null}

        {profile.birthYear === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.birth.year.label"],
                })}
              </Label>
            }
            field={
              <Input
                placeholder={intl.formatMessage({
                  id: messages[
                    "page.complete.profile.form.birth.year.placeholder"
                  ],
                })}
                value={fields.birthYear}
                register={register("birthYear", validation.birthYear)}
                type={InputType.Text}
                error={errors["birthYear"]?.message}
                autoComplete="off"
                disabled={mutation.isLoading}
              />
            }
          />
        ) : null}

        {profile.gender === null ? (
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages["page.complete.profile.form.gender.label"],
                })}
              </Label>
            }
            field={
              <Input
                value={fields.gender}
                register={register("gender")}
                type={InputType.Text}
                error={errors["gender"]?.message}
                autoComplete="off"
                disabled={mutation.isLoading}
              />
            }
          />
        ) : null}
        <Button
          disabled={mutation.isLoading || disabled}
          loading={mutation.isLoading}
          htmlType="submit"
          className="mt-8"
        >
          {intl.formatMessage({
            id: messages["global.labels.next"],
          })}
        </Button>
      </Form>
    </div>
  );
};

export default CompleteInfo;
