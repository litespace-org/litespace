import { RefreshUser, useFormatMessage, useUpdateUser } from "@/hooks";
import Title from "@/components/Settings/Title";
import { Controller, Field, Form, Label } from "@/components/Form";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button, ButtonSize } from "@/components/Button";
import { Duration } from "@litespace/sol";

type IForm = {
  notice: Duration;
};

const Notice: React.FC<{
  notice: number;
  fetching: boolean;
  user: number;
  refresh: RefreshUser;
}> = ({ fetching, notice, user, refresh }) => {
  const intl = useFormatMessage();
  const form = useForm<IForm>({
    defaultValues: { notice: Duration.from(notice.toString()) },
  });
  const data = form.watch();
  const disabled = useMemo(
    () => notice === data.notice.minutes(),
    [data.notice, notice]
  );

  const mutation = useUpdateUser(refresh);

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((data: IForm) => {
        if (data.notice.minutes() === notice) return;
        return mutation.mutate({
          id: user,
          payload: { notice: data.notice.minutes() },
        });
      }),
    [form, mutation, notice, user]
  );

  return (
    <div>
      <Title title="notice.label" loading={fetching} />
      <div className="tw-flex tw-flex-col tw-gap-2 tw-max-w-screen-md">
        <p className="tw-text-foreground-light tw-leading-relaxed">
          {intl("notice.desc.1")}&nbsp;{intl("notice.desc.2")}
        </p>
        <p className="tw-text-foreground-light tw-leading-relaxed">
          {intl("notice.desc.3")}&nbsp;<strong>{intl("notice.desc.4")}</strong>
        </p>
      </div>

      <Form
        onSubmit={onSubmit}
        className="tw-mt-6 tw-w-80 tw-flex tw-flex-col tw-gap-4"
      >
        <Field
          label={<Label>{intl("notice.label")}</Label>}
          field={
            <Controller.Duration
              placeholder={intl("notice.examples")}
              control={form.control}
              value={data.notice}
              name="notice"
            />
          }
        />
        <Button
          disabled={disabled || mutation.isPending}
          loading={mutation.isPending}
          size={ButtonSize.Small}
        >
          {intl("global.labels.confirm")}
        </Button>
      </Form>
    </div>
  );
};

export default Notice;
