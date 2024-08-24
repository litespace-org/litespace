import {
  Button,
  ButtonSize,
  DateInput,
  Dialog,
  Field,
  Form,
  Input,
  Label,
  messages,
  Select,
  TimePicker,
  toaster,
  useFormatterMap,
  useValidation,
  useValidateDuration,
  useDurationUnitMap,
  Duration as DurationInput,
} from "@litespace/luna";
import { IRule } from "@litespace/types";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import dayjs from "@/lib/dayjs";
import { Duration, Time } from "@litespace/sol";
import { useMutation } from "react-query";
import { atlas } from "@/lib/atlas";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { findUserRules } from "@/redux/user/schedule";
import { profileSelector } from "@/redux/user/me";

type IForm = {
  title: string;
  frequency: string;
  start: string;
  end: string;
  time: Time;
  duration: Duration;
  weekday: [];
  monthday: number;
};

const AddRules: React.FC = () => {
  const intl = useIntl();
  const validate = useValidation();
  const formatterMap = useFormatterMap();
  const durationMap = useDurationUnitMap();
  const validateDuration = useValidateDuration();
  const profile = useAppSelector(profileSelector);
  const dispatch = useAppDispatch();
  const form = useForm<IForm>({
    defaultValues: {
      start: dayjs().format("YYYY-MM-DD"),
      frequency: IRule.Frequency.Daily.toString(),
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: IRule.CreateApiPayload) => {
      return await atlas.rule.create(payload);
    },
    onSuccess() {
      if (profile) dispatch(findUserRules(profile.id));
      toaster.success({
        title: intl.formatMessage({
          id: messages["global.notify.schedule.update.success"],
        }),
      });
    },
    onError(error) {
      toaster.error({
        title: intl.formatMessage({
          id: messages["global.notify.schedule.update.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const onSubmit = useMemo(
    () =>
      form.handleSubmit((fields: IForm) => {
        return mutation.mutate({
          title: fields.title,
          start: dayjs(fields.start).startOf("day").utc().toISOString(),
          end: dayjs(fields.end).startOf("day").utc().toISOString(),
          frequency: Number(fields.frequency) as IRule.Frequency,
          time: fields.time.utc().format("railway"),
          duration: fields.duration.minutes(),
          weekdays: [],
        });
      }),
    [form, mutation]
  );

  const repeatOptions = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: messages["global.schedule.repeat.types.daily"],
        }),
        value: IRule.Frequency.Daily.toString(),
      },
      {
        label: intl.formatMessage({
          id: messages["global.schedule.repeat.types.weekly"],
        }),
        value: IRule.Frequency.Weekly.toString(),
      },
      {
        label: intl.formatMessage({
          id: messages["global.schedule.repeat.types.monthly"],
        }),
        value: IRule.Frequency.Monthly.toString(),
      },
    ],
    [intl]
  );

  const meridiem = useMemo(
    () => ({
      am: intl.formatMessage({
        id: messages["global.labels.am"],
      }),
      pm: intl.formatMessage({
        id: messages["global.labels.pm"],
      }),
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
          return validate.validateDate({ date, min: values.end });
        },
      },
    }),
    [validate]
  );

  const disabled = useMemo(() => mutation.isLoading, [mutation.isLoading]);

  return (
    <Dialog
      trigger={
        <Button disabled={disabled} size={ButtonSize.Small}>
          {intl.formatMessage({
            id: messages["page.schedule.edit.add"],
          })}
        </Button>
      }
      title={intl.formatMessage({
        id: messages["page.schedule.edit.add.dialog.title"],
      })}
    >
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages[
                  "page.schedule.edit.add.dialog.form.fields.title.label"
                ],
              })}
            </Label>
          }
          field={
            <Input
              placeholder={intl.formatMessage({
                id: messages[
                  "page.schedule.edit.add.dialog.form.fields.title.placeholder"
                ],
              })}
              register={form.register("title", validate.slotTitle)}
              error={form.formState.errors["title"]?.message}
              disabled={disabled}
            />
          }
        />

        <div className="flex gap-4">
          <Field
            label={
              <Label>
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.start-date.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                rules={date.start}
                name="start"
                render={({ field }) => {
                  const value = form.watch("start");
                  return (
                    <DateInput
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.start-date.placeholder"
                        ],
                      })}
                      error={form.formState.errors["start"]?.message}
                      min={dayjs().startOf("day")}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("start");
                        form.trigger("end");
                      }}
                      value={value}
                      today={intl.formatMessage({
                        id: messages["global.labels.today"],
                      })}
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
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.end-date.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                rules={date.end}
                name="end"
                render={({ field }) => {
                  const value = form.watch("end");
                  const min = form.watch("start");

                  return (
                    <DateInput
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.end-date.placeholder"
                        ],
                      })}
                      error={form.formState.errors["end"]?.message}
                      onChange={(value: string) => {
                        field.onChange(value);
                        form.trigger("start");
                        form.trigger("end");
                      }}
                      min={min ? dayjs(min) : undefined}
                      value={value || ""}
                      today={intl.formatMessage({
                        id: messages["global.labels.today"],
                      })}
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
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.start-time.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                name="time"
                rules={{ required: validate.required }}
                render={({ field }) => {
                  return (
                    <TimePicker
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.start-time.placeholder"
                        ],
                      })}
                      error={form.formState.errors["time"]?.message}
                      onChange={field.onChange}
                      labels={meridiem}
                      time={form.watch("time")}
                      formatterMap={formatterMap}
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
                {intl.formatMessage({
                  id: messages[
                    "page.schedule.edit.add.dialog.form.fields.duration.label"
                  ],
                })}
              </Label>
            }
            field={
              <Controller
                control={form.control}
                name="duration"
                rules={validateDuration}
                render={({ field }) => {
                  return (
                    <DurationInput
                      placeholder={intl.formatMessage({
                        id: messages[
                          "page.schedule.edit.add.dialog.form.fields.duration.placeholder"
                        ],
                      })}
                      error={form.formState.errors["duration"]?.message}
                      onChange={field.onChange}
                      labels={durationMap}
                      value={form.watch("duration")}
                      disabled={disabled}
                    />
                  );
                }}
              />
            }
          />
        </div>

        <Field
          label={
            <Label>
              {intl.formatMessage({
                id: messages[
                  "page.schedule.edit.add.dialog.form.fields.repeat.label"
                ],
              })}
            </Label>
          }
          field={
            <Controller
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <Select
                  value={form.watch("frequency")}
                  onChange={field.onChange}
                  list={repeatOptions}
                />
              )}
            />
          }
        />

        <Button
          loading={mutation.isLoading}
          disabled={mutation.isLoading}
          htmlType="submit"
          className="mt-4"
        >
          {intl.formatMessage({
            id: messages["global.labels.confirm"],
          })}
        </Button>
      </Form>
    </Dialog>
  );
};

export default AddRules;
