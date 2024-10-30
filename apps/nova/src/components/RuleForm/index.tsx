import {
  Button,
  DateInput,
  Dialog,
  Field,
  Form,
  Label,
  toaster,
  useTimeFormatterMap,
  useValidation,
  useValidateDuration,
  useWeekdayMap,
  Card,
  useRuleFormatterMap,
  useFormatMessage,
  Controller,
  ButtonSize,
} from "@litespace/luna";
import { IDate, IRule } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller as FormController } from "react-hook-form";
import dayjs from "@/lib/dayjs";
import { Duration } from "@litespace/sol/duration";
import { Time } from "@litespace/sol/time";
import { Schedule } from "@litespace/sol/rule";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findUserRules } from "@/redux/user/schedule";
import { profileSelectors } from "@/redux/user/profile";
import RuleAlert from "@/components/Rules/RuleAlert";
import { useCreateRule, useEditRule } from "@litespace/headless/rule";

type IForm = {
  title: string;
  frequency: IRule.Frequency;
  start: string;
  end: string;
  time: Time;
  duration: Duration;
  weekdays: IDate.Weekday[];
  monthday: number;
};

const RuleForm: React.FC<{
  rule?: IRule.Self;
  open: boolean;
  close: () => void;
}> = ({ rule, open, close }) => {
  const intl = useFormatMessage();
  const validate = useValidation();
  const formatterMap = useTimeFormatterMap();
  const weekdayMap = useWeekdayMap();
  const ruleFormatterMap = useRuleFormatterMap();
  const validateDuration = useValidateDuration();
  const profile = useAppSelector(profileSelectors.user);
  const dispatch = useAppDispatch();

  const defaultValues = useMemo((): Partial<IForm> => {
    return {
      title: rule?.title || "",
      frequency: rule?.frequency || IRule.Frequency.Daily,
      start: dayjs(rule?.start).format("YYYY-MM-DD"),
      end: rule?.end ? dayjs(rule.end).format("YYYY-MM-DD") : undefined,
      time: rule ? Time.from(rule.time).local() : undefined,
      duration: rule ? Duration.from(rule.duration.toString()) : undefined,
      weekdays: rule ? rule.weekdays : [],
      monthday: rule?.monthday || undefined,
    };
  }, [rule]);

  const form = useForm<IForm>({ defaultValues });

  const onSuccess = useCallback(() => {
    if (profile) dispatch(findUserRules.call(profile.id));
    toaster.success({
      title: intl("global.notify.schedule.update.success"),
    });
    form.reset();
    close();
  }, [dispatch, form, close, intl, profile]);

  const onError = useCallback(
    (error: unknown) => {
      toaster.error({
        title: intl("global.notify.schedule.update.error"),
        description: error instanceof Error ? error.message : undefined,
      });
    },
    [intl]
  );

  const create = useCreateRule({ onSuccess, onError });

  const update = useEditRule({ onSuccess, onError, rule });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit(async (fields: IForm) => {
        const payload = {
          title: fields.title,
          start: dayjs(fields.start).startOf("day").utc().toISOString(),
          end: dayjs(fields.end).startOf("day").utc().toISOString(),
          frequency: Number(fields.frequency) as IRule.Frequency,
          time: fields.time.utc().format("railway"),
          duration: fields.duration.minutes(),
          weekdays: fields.weekdays,
        };
        if (rule) return await update.mutate(payload);
        return await create.mutate(payload);
      }),
    [create, form, rule, update]
  );

  const frequencyOptions = useMemo(
    () => [
      {
        label: intl("global.schedule.freq.daily"),
        value: IRule.Frequency.Daily,
      },
      {
        label: intl("global.schedule.freq.weekly"),
        value: IRule.Frequency.Weekly,
      },
      {
        label: intl("global.schedule.freq.monthly"),
        value: IRule.Frequency.Monthly,
      },
    ],
    [intl]
  );

  const meridiem = useMemo(
    () => ({
      am: intl("global.labels.am"),
      pm: intl("global.labels.pm"),
    }),
    [intl]
  );

  const date = useMemo(
    () => ({
      start: {
        required: validate.required,
        validate(date: string, values: IForm) {
          return validate.validateDate({ date, max: values.end });
        },
      },
      end: {
        required: validate.required,
        validate(date: string, values: IForm) {
          return validate.validateDate({ date, min: values.start });
        },
      },
    }),
    [validate]
  );

  const disabled = useMemo(
    () => create.isPending || update.isPending,
    [create.isPending, update.isPending]
  );

  const text = useMemo(() => {
    const values = form.getValues();
    if (!values.end || !values.time || !values.duration) return null;
    return Schedule.from({
      frequency: values.frequency,
      start: dayjs(values.start).utc().toISOString(),
      end: dayjs(values.end).utc().toISOString(),
      time: values.time.utc().format(),
      duration: values.duration.minutes(),
      weekday: values.weekdays,
      monthday: values.monthday,
    })
      .withDayjs(dayjs)
      .format(ruleFormatterMap);
  }, [form, ruleFormatterMap]);

  const title = useMemo(
    () =>
      intl(
        rule
          ? "page.schedule.update.dialog.title"
          : "page.schedule.add.dialog.title"
      ),
    [intl, rule]
  );

  const buttonLabel = useMemo(
    () => intl(rule ? "global.labels.update" : "global.labels.confirm"),
    [intl, rule]
  );

  const closeDialog = useCallback(() => {
    close();
    form.reset();
  }, [close, form]);

  return (
    <Dialog title={title} open={open} close={closeDialog} className="w-[550px]">
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label={
            <Label>
              {intl("page.schedule.add.dialog.form.fields.title.label")}
            </Label>
          }
          field={
            <Controller.Input
              control={form.control}
              name="title"
              placeholder={intl(
                "page.schedule.add.dialog.form.fields.title.placeholder"
              )}
              disabled={disabled}
            />
          }
        />

        <div className="flex gap-4">
          <Field
            label={
              <Label>
                {intl("page.schedule.add.dialog.form.fields.start-date.label")}
              </Label>
            }
            field={
              <FormController
                control={form.control}
                rules={date.start}
                name="start"
                render={({ field }) => {
                  const start = form.watch("start");
                  const end = form.watch("end");
                  return (
                    <DateInput
                      placeholder={intl(
                        "page.schedule.add.dialog.form.fields.start-date.placeholder"
                      )}
                      error={form.formState.errors["start"]?.message}
                      min={dayjs().startOf("day")}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("start");
                        if (end) form.trigger("end");
                      }}
                      value={start}
                      today={intl("global.labels.today")}
                      disabled={disabled}
                    />
                  );
                }}
              />
            }
          />

          <Field
            label={
              <Label>
                {intl("page.schedule.add.dialog.form.fields.end-date.label")}
              </Label>
            }
            field={
              <FormController
                control={form.control}
                rules={date.end}
                name="end"
                render={({ field }) => {
                  const start = form.watch("start");
                  const end = form.watch("end");

                  return (
                    <DateInput
                      placeholder={intl(
                        "page.schedule.add.dialog.form.fields.end-date.placeholder"
                      )}
                      error={form.formState.errors["end"]?.message}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("end");
                        if (start) form.trigger("start");
                      }}
                      min={start ? dayjs(start) : undefined}
                      value={end || ""}
                      today={intl("global.labels.today")}
                      disabled={disabled}
                    />
                  );
                }}
              />
            }
          />
        </div>
        <div className="flex gap-4">
          <Field
            label={
              <Label>
                {intl("page.schedule.add.dialog.form.fields.start-time.label")}
              </Label>
            }
            field={
              <Controller.TimePicker
                control={form.control}
                name="time"
                rules={{ required: validate.required }}
                labels={meridiem}
                time={form.watch("time")}
                formatterMap={formatterMap}
                disabled={disabled}
              />
            }
          />

          <Field
            label={
              <Label>
                {intl("page.schedule.add.dialog.form.fields.duration.label")}
              </Label>
            }
            field={
              <Controller.Duration
                control={form.control}
                name="duration"
                rules={{
                  ...validateDuration,
                  validate: (_, form) =>
                    validateDuration.validate(form.duration),
                }}
                value={form.watch("duration")}
                disabled={disabled}
              />
            }
          />
        </div>

        <Field
          label={
            <Label>
              {intl("page.schedule.add.dialog.form.fields.weekdays.label")}
            </Label>
          }
          field={
            <Controller.WeekdayPicker
              control={form.control}
              name="weekdays"
              weekdays={form.watch("weekdays")}
              weekdayMap={weekdayMap}
              placeholder={intl(
                "page.schedule.add.dialog.form.fields.weekdays.placeholder"
              )}
            />
          }
        />

        <Field
          label={
            <Label>
              {intl("page.schedule.add.dialog.form.fields.repeat.label")}
            </Label>
          }
          field={
            <Controller.Select
              control={form.control}
              name="frequency"
              value={form.watch("frequency")}
              options={frequencyOptions}
            />
          }
        />

        {text ? (
          <Card className="mt-4">
            <p className="text-foreground-light">{text}</p>
          </Card>
        ) : null}

        {rule ? (
          <div className="mt-4">
            <RuleAlert />
          </div>
        ) : null}

        <Button
          size={ButtonSize.Small}
          loading={create.isPending || update.isPending}
          disabled={create.isPending || update.isPending}
          htmlType="submit"
          className="mt-2"
        >
          {buttonLabel}
        </Button>
      </Form>
    </Dialog>
  );
};

export default RuleForm;
